// src/lib/auth/authOptions.ts

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { AppUser } from "@/types/user";

const users: AppUser[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@jewel.com",
    password: "$2b$10$RNwxvsNyEs6U7LQ5w639DepPOs1.ATsLu3o0clb5A6WbtAb0dyjP2",
    role: "admin",
  },
  {
    id: "2",
    name: "Customer User",
    email: "customer@jewel.com",
    password: "$2b$10$6I5XPL4Yl8XUAOJMaKpdZuWPsdBfOi9yfBvbZRXKyCVyeROEykXGy",
    role: "customer",
  },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = users.find((u) => u.email === credentials?.email);
        if (user && (await compare(credentials!.password, user.password))) {
          const { password, ...userNoPass } = user;
          return userNoPass;
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "supersecret",
};
