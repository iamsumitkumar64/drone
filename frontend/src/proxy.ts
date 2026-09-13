import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ['/public', '/login', '/signup'];
const authBlockRoutes = ['/login', '/signup'];

export default function proxy(req: NextRequest) {
    const credentials = req.cookies.get("access_token")?.value;
    const role = req.cookies.get("role")?.value;
    const pathname = req.nextUrl.pathname;

    const isPublic = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`) || pathname.endsWith('.svg'));
    const isAuthBlock = authBlockRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
    const isAuthenticated = Boolean(credentials);

    if (isAuthenticated && isAuthBlock) {
        return NextResponse.redirect(new URL("/", req.url));
    }
    if (isPublic) {
        return NextResponse.next();
    }

    if (!isAuthenticated && !isPublic) {
        return NextResponse.redirect(new URL("/signup", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next|api|.*\\..*).*)'],
};