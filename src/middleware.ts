import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Add any custom logic here
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Only allows authenticated users
    },
    pages: {
      signIn: "/auth/signin", // Redirect to signin page if not authenticated
    },
  }
);

export const config = {
  matcher: ["/presale/:path*", "/profile/:path*", "/referral/:path*"],
};
