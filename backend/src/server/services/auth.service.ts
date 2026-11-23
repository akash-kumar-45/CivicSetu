import prisma from "../db";
import { hashPassword, verifyPassword } from "../auth/password";
import { RegisterInput, RegisterInputSchema, LoginInput, LoginInputSchema } from "../validators/auth.schema";

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "MEMBER" | "ADMIN";
  userIntent: "OWNER" | "WORKER" | "BOTH";
  ward: string;
  isVerified: boolean;
  skills: string[];
  bio: string | null;
  createdAt: Date;
}

const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  userIntent: true,
  ward: true,
  isVerified: true,
  skills: true,
  bio: true,
  createdAt: true,
} as const;

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
        phone: validated.phone,
        passwordHash,
        role: validated.role,
        userIntent: validated.userIntent,
        ward: validated.ward,
        idType: validated.idType,
        govIdNumber: validated.govIdNumber,
        isVerified: validated.isVerified,
        skills: validated.skills,
        bio: validated.bio || null,
      },
      select: SAFE_USER_SELECT,
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
      phone: user.phone,
      role: user.role,
      userIntent: user.userIntent,
      ward: user.ward,
      isVerified: user.isVerified,
      skills: user.skills,
      bio: user.bio,
      createdAt: user.createdAt,
    };
  }

  async getUserById(id: string): Promise<SafeUser | null> {
    const user = await this.db.user.findUnique({
      where: { id },
      select: SAFE_USER_SELECT,
    });

    return user;
  }
}

export const authService = new AuthService();