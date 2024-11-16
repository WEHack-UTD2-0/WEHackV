// import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
// import { db } from "db";
// import { eq } from "db/drizzle";
// import { userHackerData, teams } from "db/schema";
// import { getHacker } from "db/functions";
// import { newTeamValidator } from "@/validators/shared/team";
// import { nanoid } from "nanoid";
// import c from "config";
// import { getWebSocketDb } from "db/functions";

export async function POST(req: Request) {
	// const { userId } = auth();
	// if (!userId) return new Response("Unauthorized", { status: 401 });

	// const user = await getHacker(userId, false);
	// if (!user) return new Response("Unauthorized", { status: 401 });

	// if (user.hackerData.teamID) {
	// 	return NextResponse.json({
	// 		success: false,
	// 		message:
	// 			"You are already on a team. Leave your current team to create a new one.",
	// 	});
	// }

	// const rawBody = await req.json();
	// const body = newTeamValidator.safeParse(rawBody);

	// if (!body.success) {
	// 	return NextResponse.json({
	// 		success: false,
	// 		message: body.error.message,
	// 	});
	// }

	// const teamID = nanoid();
	// const webSocketDb = getWebSocketDb();

	// try {
	// 	await webSocketDb.transaction(async (tx) => {
	// 		await tx.insert(teams).values({
	// 			id: teamID,
	// 			name: body.data.name,
	// 			tag: body.data.tag,
	// 			photo: body.data.photo,
	// 			ownerID: userId,
	// 		});
	// 		await tx
	// 			.update(userHackerData)
	// 			.set({ teamID })
	// 			.where(eq(userHackerData.clerkID, userId));
	// 	});
	// 	return NextResponse.json({
	// 		success: true,
	// 		message: body.data.tag,
	// 	});
	// } catch (e) {
	// 	// const errorID = await logError({
	// 	// 	error: e,
	// 	// 	userID: userId,
	// 	// 	route: "/api/team/create",
	// 	// });
	// 	console.error(`Something went wrong: ${e}`);
	// 	// with error ID ${errorID
	// 	return NextResponse.json({
	// 		success: false,
	// 		message: `An error occurred while creating your team. If this is a continuing issue, please reach out to ${c.issueEmail}}.`,
	// 	});
	// }
	return NextResponse.json({
		success: true,
		message: ""
	});
}

// export const runtime = "edge";
