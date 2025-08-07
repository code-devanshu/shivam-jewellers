import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { AppUser } from "@/types/user";

const users: AppUser[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@jewel.com",
    password: "$2b$10$RNwxvsNyEs6U7LQ5w639DepPOs1.ATsLu3o0clb5A6WbtAb0dyjP2", // "admin123" hashed
    role: "admin",
  },
  {
    id: "2",
    name: "Customer User",
    email: "customer@jewel.com",
    password: "$2b$10$6I5XPL4Yl8XUAOJMaKpdZuWPsdBfOi9yfBvbZRXKyCVyeROEykXGy", // "customer123" hashed
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
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        token.role = (user as AppUser).role;
        token.id = (user as AppUser).id;
        token.email = (user as AppUser).email;
        token.name = (user as AppUser).name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "supersecret",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
