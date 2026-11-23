import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authService } from "@coop/backend/server/services/auth.service";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "citizen@civicsetu.in" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await authService.authenticate({
            email: credentials.email,
            password: credentials.password,
          });

          if (!user) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            userIntent: user.userIntent,
            ward: user.ward,
            phone: user.phone,
            isVerified: user.isVerified,
            skills: user.skills,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.userIntent = (user as any).userIntent;
        token.ward = (user as any).ward;
        token.phone = (user as any).phone;
        token.isVerified = (user as any).isVerified;
        token.skills = (user as any).skills;
      }
      if (trigger === "update" && session?.user) {
        token.name = session.user.name ?? token.name;
        token.ward = session.user.ward ?? token.ward;
        token.phone = session.user.phone ?? token.phone;
        token.userIntent = session.user.userIntent ?? token.userIntent;
        token.skills = session.user.skills ?? token.skills;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).userIntent = token.userIntent;
        (session.user as any).ward = token.ward;
        (session.user as any).phone = token.phone;
        (session.user as any).isVerified = token.isVerified;
        (session.user as any).skills = token.skills;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "cooperative-development-fallback-secret-2026",
};