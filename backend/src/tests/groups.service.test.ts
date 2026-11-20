import { describe, it, expect, vi, beforeEach } from "vitest";
import { GroupsService } from "../server/services/groups.service";

describe("GroupsService", () => {
  let mockDb: any;
  let groupsService: GroupsService;

  beforeEach(() => {
    mockDb = {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      coopGroup: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      membership: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    groupsService = new GroupsService(mockDb);
  });

  describe("createGroup", () => {
    it("should create a group, elevate creator to ADMIN, and set membership to ACTIVE", async () => {
      mockDb.user.findUnique.mockResolvedValue({ id: "user-1", role: "MEMBER" });
      mockDb.user.update.mockResolvedValue({ id: "user-1", role: "ADMIN" });
      mockDb.coopGroup.create.mockResolvedValue({
        id: "group-100",
        name: "Maple Street Society",
        locality: "North District",
        memberships: [{ userId: "user-1", status: "ACTIVE" }],
      });

      const group = await groupsService.createGroup("user-1", {
        name: "Maple Street Society",
        locality: "North District",
      });

      expect(mockDb.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { role: "ADMIN" },
      });
      expect(mockDb.coopGroup.create).toHaveBeenCalled();
      expect(group.id).toBe("group-100");
    });
  });

  describe("requestToJoin", () => {
    it("should allow a user to submit a join request with status PENDING", async () => {
      mockDb.coopGroup.findUnique.mockResolvedValue({ id: "group-100" });
      mockDb.membership.findUnique.mockResolvedValue(null);
      mockDb.membership.create.mockResolvedValue({
        id: "m-1",
        userId: "user-2",
        groupId: "group-100",
        status: "PENDING",
      });

      const membership = await groupsService.requestToJoin("user-2", "group-100");
      expect(membership.status).toBe("PENDING");
      expect(mockDb.membership.create).toHaveBeenCalledWith({
        data: {
          userId: "user-2",
          groupId: "group-100",
          status: "PENDING",
        },
      });
    });

    it("should reject join request if user is already an ACTIVE member", async () => {
      mockDb.coopGroup.findUnique.mockResolvedValue({ id: "group-100" });
      mockDb.membership.findUnique.mockResolvedValue({
        id: "m-1",
        userId: "user-2",
        groupId: "group-100",
        status: "ACTIVE",
      });

      await expect(
        groupsService.requestToJoin("user-2", "group-100")
      ).rejects.toThrow("You are already an active member of this group");
    });

    it("should reject join request if request is already PENDING", async () => {
      mockDb.coopGroup.findUnique.mockResolvedValue({ id: "group-100" });
      mockDb.membership.findUnique.mockResolvedValue({
        id: "m-1",
        userId: "user-2",
        groupId: "group-100",
        status: "PENDING",
      });

      await expect(
        groupsService.requestToJoin("user-2", "group-100")
      ).rejects.toThrow("Your membership request is currently pending admin approval");
    });

    it("should reject join request if membership is SUSPENDED", async () => {
      mockDb.coopGroup.findUnique.mockResolvedValue({ id: "group-100" });
      mockDb.membership.findUnique.mockResolvedValue({
        id: "m-1",
        userId: "user-2",
        groupId: "group-100",
        status: "SUSPENDED",
      });

      await expect(
        groupsService.requestToJoin("user-2", "group-100")
      ).rejects.toThrow("Your membership in this cooperative group has been suspended");
    });
  });

  describe("approveMember", () => {
    it("should reject approval if caller is not an admin", async () => {
      // Caller has role MEMBER
      mockDb.membership.findUnique.mockResolvedValueOnce({
        userId: "user-caller",
        groupId: "group-100",
        status: "ACTIVE",
        user: { role: "MEMBER" },
      });

      await expect(
        groupsService.approveMember("user-caller", "group-100", "target-user")
      ).rejects.toThrow("Forbidden: Only group admins can approve members");
    });

    it("should allow an admin to transition member status to ACTIVE", async () => {
      // Caller has role ADMIN
      mockDb.membership.findUnique
        .mockResolvedValueOnce({
          userId: "admin-1",
          groupId: "group-100",
          status: "ACTIVE",
          user: { role: "ADMIN" },
        })
        .mockResolvedValueOnce({
          userId: "target-user",
          groupId: "group-100",
          status: "PENDING",
        });

      mockDb.membership.update.mockResolvedValue({
        userId: "target-user",
        groupId: "group-100",
        status: "ACTIVE",
      });

      const result = await groupsService.approveMember("admin-1", "group-100", "target-user");
      expect(result.status).toBe("ACTIVE");
      expect(mockDb.membership.update).toHaveBeenCalledWith({
        where: {
          userId_groupId: {
            userId: "target-user",
            groupId: "group-100",
          },
        },
        data: { status: "ACTIVE" },
      });
    });
  });

  describe("suspendMember", () => {
    it("should reject suspension if admin attempts to suspend themselves", async () => {
      mockDb.membership.findUnique.mockResolvedValueOnce({
        userId: "admin-1",
        groupId: "group-100",
        status: "ACTIVE",
        user: { role: "ADMIN" },
      });

      await expect(
        groupsService.suspendMember("admin-1", "group-100", "admin-1")
      ).rejects.toThrow("Admins cannot suspend their own membership");
    });

    it("should allow admin to suspend an ACTIVE member", async () => {
      mockDb.membership.findUnique
        .mockResolvedValueOnce({
          userId: "admin-1",
          groupId: "group-100",
          status: "ACTIVE",
          user: { role: "ADMIN" },
        })
        .mockResolvedValueOnce({
          userId: "target-user",
          groupId: "group-100",
          status: "ACTIVE",
        });

      mockDb.membership.update.mockResolvedValue({
        userId: "target-user",
        groupId: "group-100",
        status: "SUSPENDED",
      });

      const result = await groupsService.suspendMember("admin-1", "group-100", "target-user");
      expect(result.status).toBe("SUSPENDED");
    });
  });

  describe("rejectMember", () => {
    it("should delete membership request when rejected by admin", async () => {
      mockDb.membership.findUnique
        .mockResolvedValueOnce({
          userId: "admin-1",
          groupId: "group-100",
          status: "ACTIVE",
          user: { role: "ADMIN" },
        })
        .mockResolvedValueOnce({
          userId: "target-user",
          groupId: "group-100",
          status: "PENDING",
        });

      mockDb.membership.delete.mockResolvedValue({});

      const result = await groupsService.rejectMember("admin-1", "group-100", "target-user");
      expect(result.message).toBe("Membership request rejected");
      expect(mockDb.membership.delete).toHaveBeenCalled();
    });
  });
});
