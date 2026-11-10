import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "aqarflow_session";

export function middleware(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/properties/:path*",
    "/leads/:path*",
    "/visits/:path*",
    "/deals/:path*",
    "/team/:path*",
  ],
};
