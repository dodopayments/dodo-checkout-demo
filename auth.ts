import NextAuth, { NextAuthConfig } from "next-auth";
import Resend from "next-auth/providers/resend";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongo"; // Update the import

const config: NextAuthConfig = {
    providers: [
        Resend({
            apiKey: process.env.RESEND_API_KEY!,
            from: process.env.FROM_EMAIL!,
            name: "Email",
        }),
        Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        }),
    ],
    adapter: MongoDBAdapter(clientPromise),
    callbacks: {
        async redirect({ url, baseUrl }) {
            if (url.startsWith(baseUrl)) {
                return '/dashboard';
            }
            return url;
        },
    },
    pages: {
        signIn: "/auth/signin", // Custom sign-in page
        signOut: "/auth/signout", // Custom sign-out page
        error: "/auth/error", // Custom error page
    },
    session: {
        strategy: "jwt",
    },
};

export const { handlers, signIn, signOut, auth } = NextAuth(config);
