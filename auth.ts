import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./lib/db";
import authConfig from "./auth.config";
import { getUserById } from "./data/user";
import { getTwoFactorConfirmByUserId } from "./data/two-factor-confirm";
import { getAccountUserId } from "./data/account";
import { UserRole } from "@prisma/client";
import { Adapter as CoreAdapter } from "@auth/core/adapters";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  unstable_update,
} = NextAuth({
  pages: {
    signIn: "/login",
    error: "/error",
  },

  events: {
    async linkAccount({ user }) {
      if (!user) return;

      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },

  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") return true;

      const existingUser = await getUserById(user.id);

      if (!existingUser?.emailVerified) return false;

      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation =
          await getTwoFactorConfirmByUserId(existingUser.id);

        if (!twoFactorConfirmation) return false;

        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      }

      return true;
    },

    // Session callback moved to auth.config.ts for Edge middleware support

    async jwt({ token, user, trigger }) {
      // 🚀 Fix for HTTP 431 Request Header Fields Too Large
      // NextAuth implicitly merges the returned user object from authorize() into the token.
      // If the user has a large base64 image or other large fields, it causes the cookies to exceed the 16KB limit.
      if (user) {
        delete token.image;
        delete token.picture;
        delete token.password;
        delete token.imageKey;
        // Keep only essential fields if necessary, but Auth.js requires some base fields.
      }

      if (!token.sub) return token;

      // 🔁 When client calls update() → renew session
      if (trigger === "update") {
        token.exp = Math.floor(Date.now() / 1000) + 15 * 60;
        return token;
      }

      const existingUser = await getUserById(token.sub);
      if (!existingUser) return token;

      const existingAccount = await getAccountUserId(existingUser.id);

      token.isOAuth = !!existingAccount;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
      token.agencyDetailsId = existingUser.agencyDetailsId;

      return token;
    },
  },

  adapter: PrismaAdapter(db) as CoreAdapter,

  session: {
    strategy: "jwt",
    maxAge: 15 * 60, // 15 minutes
  },
});
