import prisma from "../db";
import { CreateGroupInput, CreateGroupSchema } from "../validators/groups.schema";

export class GroupsService {
  private db: typeof prisma;

  constructor(customDb?: typeof prisma) {
    this.db = customDb || prisma;
  }

  async verifyGroupAdmin(userId: string, groupId: string): Promise<boolean> {
    const membership = await this.db.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
      include: {
        user: true,
      },
    });

    if (!membership || membership.status !== "ACTIVE" || membership.user.role !== "ADMIN") {
      return false;
    }

    return true;
  }

  async verifyActiveMembership(userId: string, groupId: string): Promise<boolean> {
    const membership = await this.db.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    return !!membership && membership.status === "ACTIVE";
  }

  async createGroup(creatorUserId: string, rawInput: CreateGroupInput) {
    const validated = CreateGroupSchema.parse(rawInput);

    // Verify creator user exists
    const user = await this.db.user.findUnique({
      where: { id: creatorUserId },
    });

    if (!user) {
      throw new Error("Creator user not found");
    }

    // Elevate creator to ADMIN if they are MEMBER
    if (user.role !== "ADMIN") {
      await this.db.user.update({
        where: { id: creatorUserId },
        data: { role: "ADMIN" },
      });
    }

    // Create group and initial admin membership atomically
    const group = await this.db.coopGroup.create({
      data: {
        name: validated.name,
        locality: validated.locality,
        memberships: {
          create: {
            userId: creatorUserId,
            status: "ACTIVE",
          },
        },
      },
      include: {
        memberships: true,
      },
    });

    return group;
  }

  async requestToJoin(userId: string, groupId: string) {
    const group = await this.db.coopGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new Error("Cooperative group not found");
    }

    const existingMembership = await this.db.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (existingMembership) {
      if (existingMembership.status === "ACTIVE") {
        throw new Error("You are already an active member of this group");
      }
      if (existingMembership.status === "PENDING") {
        throw new Error("Your membership request is currently pending admin approval");
      }
      if (existingMembership.status === "SUSPENDED") {
        throw new Error("Your membership in this cooperative group has been suspended");
      }
    }

    const membership = await this.db.membership.create({
      data: {
        userId,
        groupId,
        status: "PENDING",
      },
    });

    return membership;
  }

  async approveMember(adminUserId: string, groupId: string, targetUserId: string) {
    const isAdmin = await this.verifyGroupAdmin(adminUserId, groupId);
    if (!isAdmin) {
      throw new Error("Forbidden: Only group admins can approve members");
    }

    const targetMembership = await this.db.membership.findUnique({
      where: {
        userId_groupId: {
          userId: targetUserId,
          groupId,
        },
      },
    });

    if (!targetMembership) {
      throw new Error("Membership request not found");
    }

    if (targetMembership.status === "ACTIVE") {
      throw new Error("Member is already active");
    }

    const updated = await this.db.membership.update({
      where: {
        userId_groupId: {
          userId: targetUserId,
          groupId,
        },
      },
      data: {
        status: "ACTIVE",
      },
    });

    return updated;
  }

  async rejectMember(adminUserId: string, groupId: string, targetUserId: string) {
    const isAdmin = await this.verifyGroupAdmin(adminUserId, groupId);
    if (!isAdmin) {
      throw new Error("Forbidden: Only group admins can reject member requests");
    }

    const targetMembership = await this.db.membership.findUnique({
      where: {
        userId_groupId: {
          userId: targetUserId,
          groupId,
        },
      },
    });

    if (!targetMembership) {
      throw new Error("Membership request not found");
    }

    await this.db.membership.delete({
      where: {
        userId_groupId: {
          userId: targetUserId,
          groupId,
        },
      },
    });

    return { message: "Membership request rejected" };
  }

  async suspendMember(adminUserId: string, groupId: string, targetUserId: string) {
    const isAdmin = await this.verifyGroupAdmin(adminUserId, groupId);
    if (!isAdmin) {
      throw new Error("Forbidden: Only group admins can suspend members");
    }

    if (adminUserId === targetUserId) {
      throw new Error("Admins cannot suspend their own membership");
    }

    const targetMembership = await this.db.membership.findUnique({
      where: {
        userId_groupId: {
          userId: targetUserId,
          groupId,
        },
      },
    });

    if (!targetMembership) {
      throw new Error("Member not found in this group");
    }

    if (targetMembership.status === "SUSPENDED") {
      throw new Error("Member is already suspended");
    }

    const updated = await this.db.membership.update({
      where: {
        userId_groupId: {
          userId: targetUserId,
          groupId,
        },
      },
      data: {
        status: "SUSPENDED",
      },
    });

    return updated;
  }

  async listGroups(callerUserId?: string) {
    const groups = await this.db.coopGroup.findMany({
      include: {
        _count: {
          select: {
            memberships: {
              where: { status: "ACTIVE" },
            },
            listings: {
              where: { active: true },
            },
          },
        },
        memberships: callerUserId
          ? {
              where: { userId: callerUserId },
              select: { status: true },
            }
          : false,
      },
      orderBy: { createdAt: "desc" },
    });

    return groups.map((g: any) => ({
      id: g.id,
      name: g.name,
      locality: g.locality,
      createdAt: g.createdAt,
      activeMembersCount: g._count.memberships,
      activeListingsCount: g._count.listings,
      userMembershipStatus: g.memberships?.[0]?.status ?? null,
    }));
  }

  async getGroupDetails(groupId: string, callerUserId: string) {
    const group = await this.db.coopGroup.findUnique({
      where: { id: groupId },
      include: {
        memberships: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
        _count: {
          select: {
            listings: { where: { active: true } },
          },
        },
      },
    });

    if (!group) {
      throw new Error("Cooperative group not found");
    }

    const callerMembership = group.memberships.find((m: any) => m.userId === callerUserId);
    const isCallerAdmin = callerMembership?.status === "ACTIVE" && callerMembership.user.role === "ADMIN";

    return {
      id: group.id,
      name: group.name,
      locality: group.locality,
      createdAt: group.createdAt,
      callerStatus: callerMembership?.status ?? null,
      isCallerAdmin,
      activeMembersCount: group.memberships.filter((m: any) => m.status === "ACTIVE").length,
      members: isCallerAdmin ? group.memberships : undefined,
    };
  }
}

export const groupsService = new GroupsService();
