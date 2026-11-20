import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../server/services/auth.service";
import * as passwordUtils from "../server/auth/password";

describe("AuthService", () => {
  let mockDb: any;
  let authService: AuthService;

  beforeEach(() => {
    mockDb = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };
    authService = new AuthService(mockDb);
  });

  describe("register", () => {
    it("should successfully register a new user and hash the password", async () => {
      mockDb.user.findUnique.mockResolvedValue(null);
      mockDb.user.create.mockResolvedValue({
        id: "user-123",
        name: "Alice Smith",
        email: "alice@example.com",
        role: "MEMBER",
        createdAt: new Date(),
      });

      const user = await authService.register({
        name: "Alice Smith",
        email: "alice@example.com",
        password: "securepassword123",
      });

      expect(user).toBeDefined();
      expect(user.email).toBe("alice@example.com");
      expect(user.role).toBe("MEMBER");
      expect(mockDb.user.findUnique).toHaveBeenCalledWith({
        where: { email: "alice@example.com" },
      });
      expect(mockDb.user.create).toHaveBeenCalled();
    });

    it("should reject registration if email is already in use", async () => {
      mockDb.user.findUnique.mockResolvedValue({
        id: "existing-id",
        email: "alice@example.com",
      });

      await expect(
        authService.register({
          name: "Alice Smith",
          email: "alice@example.com",
          password: "securepassword123",
        })
      ).rejects.toThrow("An account with this email address already exists");
    });

    it("should reject invalid email or short password via Zod validation", async () => {
      await expect(
        authService.register({
          name: "A",
          email: "invalid-email",
          password: "short",
        })
      ).rejects.toThrow();
    });
  });

  describe("authenticate", () => {
    it("should return safe user when credentials match", async () => {
      const hashedPassword = await passwordUtils.hashPassword("correctPassword123");
      mockDb.user.findUnique.mockResolvedValue({
        id: "user-1",
        name: "Bob",
        email: "bob@example.com",
        passwordHash: hashedPassword,
        role: "MEMBER",
        createdAt: new Date(),
      });

      const result = await authService.authenticate({
        email: "bob@example.com",
        password: "correctPassword123",
      });

      expect(result).not.toBeNull();
      expect(result?.name).toBe("Bob");
      expect(result?.email).toBe("bob@example.com");
    });

    it("should return null when password does not match", async () => {
      const hashedPassword = await passwordUtils.hashPassword("correctPassword123");
      mockDb.user.findUnique.mockResolvedValue({
        id: "user-1",
        name: "Bob",
        email: "bob@example.com",
        passwordHash: hashedPassword,
        role: "MEMBER",
        createdAt: new Date(),
      });

      const result = await authService.authenticate({
        email: "bob@example.com",
        password: "wrongPassword",
      });

      expect(result).toBeNull();
    });

    it("should return null when user does not exist", async () => {
      mockDb.user.findUnique.mockResolvedValue(null);

      const result = await authService.authenticate({
        email: "unknown@example.com",
        password: "password123",
      });

      expect(result).toBeNull();
    });
  });
});
