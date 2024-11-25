import NextAuth from "next-auth"
import { SupabaseAdapter } from "@auth/supabase-adapter"
import Google from "next-auth/providers/google"
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [Google],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnMyAccount = nextUrl.pathname.startsWith("/my-account");

      if (isOnMyAccount) {
        if (isLoggedIn) return true;
        return false; 
      }

      return true; 
    },
  },
  
})