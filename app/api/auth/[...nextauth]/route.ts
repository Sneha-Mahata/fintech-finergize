// app/api/auth/[...nextauth]/route.ts
import * as NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from '@/lib/database/config';
import User from '@/models/User';
import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        phone: { label: "Phone", type: "text" },
        aadhaarNumber: { label: "Aadhaar Number", type: "password" }
      },
      async authorize(credentials, req) {
        try {
          // More graceful handling of database connection
          try {
            await dbConnect();
          } catch (dbError) {
            console.error("Database connection error:", dbError);
            return null;
          }
          
          console.log("Attempting login with:", credentials?.phone); // Debug log
          
          const user = await User.findOne({ phone: credentials?.phone });
          if (!user) {
            console.log("No user found"); // Debug log
            return null;
          }
          
          if (user.aadhaarNumber !== credentials?.aadhaarNumber) {
            console.log("Invalid Aadhaar"); // Debug log
            return null;
          }
          
          console.log("Login successful for:", user.phone); // Debug log
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.phone,
            phone: user.phone
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.phone = token.phone as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

// Updated handler export to use NextAuth.default
const handler = NextAuth.default(authOptions);
export { handler as GET, handler as POST };