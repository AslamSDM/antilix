import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    // Path to verification needed page
    const verificationNeededPath = "/auth/verification-needed";

    // If user is logged in but not verified, redirect to verification page
    if (
      token &&
      !token.verified &&
      !req.nextUrl.pathname.startsWith(verificationNeededPath) &&
      !req.nextUrl.pathname.startsWith("/auth/verify-email") &&
      !req.nextUrl.pathname.startsWith("/auth/verify")
    ) {
      // Create the verification needed URL
      const verificationUrl = new URL(verificationNeededPath, req.url);
      verificationUrl.searchParams.set("email", token.email || "");

      // Redirect to verification page
      return NextResponse.redirect(verificationUrl);
    }

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
  matcher: [
    "/presale/:path*",
    "/profile/:path*",
    "/referral/:path*",
    "/dashboard/:path*",
    "/api/protected/:path*",
  ],
};
