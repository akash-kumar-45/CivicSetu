import prisma from "../db";
import { hashPassword, verifyPassword } from "../auth/password";
import { RegisterInput, RegisterInputSchema, LoginInput, LoginInputSchema } from "../validators/auth.schema";

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: "MEMBER" | "ADMIN";
  createdAt: Date;
}

export class AuthService {
  private db: typeof prisma;

  constructor(customDb?: typeof prisma) {
    this.db = customDb || prisma;
  }

  async register(rawInput: RegisterInput): Promise<SafeUser> {
    const validated = RegisterInputSchema.parse(rawInput);

    const existing = await this.db.user.findUnique({
      where: { email: validated.email },
    });

    if (existing) {
      throw new Error("An account with this email address already exists");
    }

    const passwordHash = await hashPassword(validated.password);

    const user = await this.db.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        passwordHash,
        role: validated.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  async authenticate(rawInput: LoginInput): Promise<SafeUser | null> {
    const validated = LoginInputSchema.parse(rawInput);

    const user = await this.db.user.findUnique({
      where: { email: validated.email },
    });

    if (!user) {
      return null;
    }

    const isValid = await verifyPassword(validated.password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async getUserById(id: string): Promise<SafeUser | null> {
    const user = await this.db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }
}

export const authService = new AuthService();
