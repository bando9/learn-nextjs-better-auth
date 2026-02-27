import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { getResetPasswordEmailHtml } from "./email-template";
import { FROM_EMAIL, resend } from "./resend";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,

    sendResetPassword: async ({ user, url }) => {
      // console.log(`Reset password for ${user.email} : ${url}`);
      try {
        const emailHTML = getResetPasswordEmailHtml(user.email, url);

        const { data, error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: user.email,
          subject: "Reset your password",
          html: emailHTML,
        });

        if (error) {
          // console.error("Failed to send reset password email:", error);
          throw new Error("Failed to send reset password email");
        }
        // console.log("Reset password email sent successfully to:", user.email);
        // console.log("Email ID:", data?.id);

        if (process.env.NODE_ENV === "development") {
          console.log("Reset URL (dev only):", url);
        }
      } catch (error) {
        console.error("Error in sendResetPassword:", error);
        throw error;
      }
    },
  },
});
