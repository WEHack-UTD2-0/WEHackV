import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { publicRoutes } from "config";

export default authMiddleware({
	publicRoutes,
	beforeAuth: (req) => {
		console.log(`Incoming request: ${req.method} ${req.nextUrl.pathname}`);
		if (publicRoutes.includes(req.nextUrl.pathname)) {
			console.log(`${req.nextUrl.pathname} is a Public route`);
		}

		// if (req.nextUrl.pathname === "/api/uploadthing") {
		// 	console.log("Excluding /api/uploadthing from authMiddleware");
		// 	return NextResponse.next();
		// }
		if (req.nextUrl.pathname.startsWith("/@")) {
			return NextResponse.rewrite(
				new URL(
					`/user/${req.nextUrl.pathname.replace("/@", "")}`,
					req.url,
				),
			);
		}
		if (req.nextUrl.pathname.startsWith("/~")) {
			return NextResponse.rewrite(
				new URL(
					`/team/${req.nextUrl.pathname.replace("/~", "")}`,
					req.url,
				),
			);
		}
		return NextResponse.next();
	},
	afterAuth: (req) => {
		const user = req.userId;
		if (user) {
		  console.log(`Authenticated user: ${user}`);
		} else {
		  console.log(`Reject reason: Unauthorized - No user found`);
		}
		return NextResponse.next();
	  },
});

export const config = {
	matcher: ["/((?!.*\\..*|_next).*)", "/"],
};
//"/(api|trpc)(.*)"