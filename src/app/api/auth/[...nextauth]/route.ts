import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { Session } from "next-auth";

// Extend the Session type to include our custom properties
interface ExtendedSession extends Session {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

// Define Admin interface based on your Prisma schema
interface Admin {
  id: string;
  username: string;
  password: string;
}

const prisma = new PrismaClient();

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // Find the admin by username using raw query
          const admin = await prisma.$queryRaw`
            SELECT * FROM "Admin" 
            WHERE username = ${credentials.username} 
            LIMIT 1
          `;

          // Convert the result to an array and get the first item
          const adminArray = admin as Admin[];
          if (!adminArray || adminArray.length === 0) {
            return null;
          }

          const foundAdmin = adminArray[0];

          // For now, we're comparing plain text passwords
          // In a real app, you should hash passwords with bcrypt
          const passwordMatch = credentials.password === foundAdmin.password;

          if (!passwordMatch) {
            return null;
          }

          return {
            id: foundAdmin.id,
            name: foundAdmin.username,
            email: foundAdmin.username, // NextAuth requires an email, using username as fallback
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      const extendedSession = session as ExtendedSession;
      if (token && extendedSession.user) {
        extendedSession.user.id = token.id as string;
        extendedSession.user.name = token.name as string;
      }
      return extendedSession;
    },
  },
});

export { handler as GET, handler as POST }; 