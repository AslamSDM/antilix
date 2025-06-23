import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

// Create a middleware for auth pages to redirect authenticated users
async function authPagesMiddleware(req: NextRequest) {
  const token = await getToken({ req });

  // If user is authenticated and trying to access sign-in or sign-up page,
  // automatically redirect to presale page
  if (token) {
    return NextResponse.redirect(new URL("/presale", req.url));
  }

  return NextResponse.next();
}
async function presaleMiddleware(req: NextRequest) {
  const token = await getToken({ req });

  // If user is authenticated and trying to access sign-in or sign-up page,
  // automatically redirect to presale page
  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  return NextResponse.next();
}

// Main middleware function that handles both auth pages and protected routes
export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log("Middleware triggered for path:", req);

  // For auth pages (signin/signup), use authPagesMiddleware to redirect to presale if logged in
  if (pathname === "/auth/signin" || pathname === "/auth/signup") {
    return authPagesMiddleware(req);
  }
  if (pathname === "/presale" || pathname.startsWith("/profile")) {
    return presaleMiddleware(req);
  }

  // For protected routes, let the default NextAuth middleware handle it
  return NextResponse.next();
}

// Protected routes middleware using withAuth
export const { auth } = {
  auth: withAuth(
    function middleware(req) {
      const token = req.nextauth.token;
      console.log("Token in middleware:", token);
      // Path to verification needed page
      const verificationNeededPath = "/auth/verification-needed";
      if (token && !token.verified) {
        return NextResponse.redirect(new URL(verificationNeededPath, req.url));
      }

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
  ),
};

export const config = {
  matcher: [
    "/auth/signin",
    "/auth/signup",
    "/presale/:path*",
    "/profile/:path*",
    "/referral/:path*",
    "/dashboard/:path*",
    "/api/protected/:path*",
  ],
};
