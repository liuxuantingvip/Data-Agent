import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE, createAdminSessionValue, verifyAdminCredentials } from "@/lib/admin-auth";

function getRequestBaseUrl(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host") ?? new URL(request.url).host;
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const protocol =
    forwardedProto ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");

  return `${protocol}://${host}`;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "/admin/feedback");
  const baseUrl = getRequestBaseUrl(request);

  if (!verifyAdminCredentials(username, password)) {
    return NextResponse.redirect(new URL(`/admin/login?error=1&next=${encodeURIComponent(nextPath)}`, baseUrl));
  }

  const requestUrl = new URL(request.url);
  const secureCookie =
    process.env.NODE_ENV === "production" &&
    requestUrl.hostname !== "localhost" &&
    requestUrl.hostname !== "127.0.0.1";

  const response = NextResponse.redirect(
    new URL(nextPath.startsWith("/admin") ? nextPath : "/admin/feedback", baseUrl),
  );
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: createAdminSessionValue(),
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return response;
}
