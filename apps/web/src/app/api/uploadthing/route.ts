import { createRouteHandler } from "uploadthing/next";
import { auth } from "@clerk/nextjs";
import { ourFileRouter } from "./core";
import { NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";


// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
	router: ourFileRouter,
	// Apply an (optional) custom config:
	// config: { ... },
});

// export default async function uploadthing(req: NextRequest) {
// 	const { userId } = getAuth(req);
// 	if (userId) {
// 		// add the userId to the body
// 		const body = await req.json();
// 		const updatedBody = { ...body, userId };
// 	}
// }