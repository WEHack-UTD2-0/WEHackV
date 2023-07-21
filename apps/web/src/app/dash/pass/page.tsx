import QRCode from "react-qr-code";
import { currentUser } from "@clerk/nextjs";
import superjson from "superjson";
import { db } from "@/db";
import { eq, InferModel } from "drizzle-orm";
import { users } from "@/db/schema";
import Image from "next/image";
import c from "@/hackkit.config";
import { format } from "date-fns";

interface EventPassProps {
	user: InferModel<typeof users>;
	clerk: NonNullable<Awaited<ReturnType<typeof currentUser>>>;
	qrPayload: string;
}

export default async function Page() {
	const user = await currentUser();
	if (!user) return null;

	const userDbRecord = await db.query.users.findFirst({
		where: eq(users.clerkID, user.id),
	});

	if (!userDbRecord) return null;

	const qrPayload = superjson.stringify({ userId: user.id, createdAt: Date.now() });

	return (
		<div className="flex items-center justify-center h-[calc(100vh-7rem)]">
			{/* <QRCode value={qrObject} /> */}
			<EventPass user={userDbRecord} qrPayload={qrPayload} clerk={user} />
		</div>
	);
}

function EventPass({ qrPayload, user, clerk }: EventPassProps) {
	return (
		<div className="border-muted border max-w-[400px] max-h-[calc(100vh-7rem)] w-full aspect-[9/16] rounded-3xl flex flex-col overflow-hidden pt-5 relative">
			<div className="w-full relative h-[30%]">
				<Image
					src={clerk.imageUrl}
					alt={`${user.firstName}'s Profile Picture`}
					width={100}
					height={100}
					className="rounded-full mx-auto"
				/>
				<h1 className="text-4xl font-bold text-center mt-2">{user.firstName}</h1>
				<h2 className="font-mono text-center">@{user.hackerTag}</h2>
			</div>
			<div className="h-[45%] w-full relative flex items-end">
				<div className="absolute left-1/2 top-1/2 w-[200px] aspect-square -translate-x-1/2 -translate-y-[65%] bg-hackathon opacity-60 blur-[50px]"></div>
				<Image
					src={c.eventPassBgImage}
					alt={""}
					fill
					className="object-contain -translate-y-[15%]"
				/>
				<div className="w-full h-20 grid grid-cols-2">
					<div className="w-full h-full flex items-center justify-start pl-2">
						<Image src={c.icon.svg} height={60} width={60} alt={`${c.hackathonName} Logo`} />
						<h1 className="font-bold ml-1 text-lg">
							{c.hackathonName} <span className="text-hackathon">{c.itteration}</span>
						</h1>
					</div>
					<div className="w-full h-full flex flex-col justify-center items-end pr-3 gap-y-1">
						<p className="font-mono text-xs">{`${format(c.startDate, "h:mma, MMM d, yyyy")}`}</p>
						<p className="font-mono text-xs">{c.prettyLocation}</p>
					</div>
				</div>
			</div>
			<div className="h-[25%] w-full flex items-center justify-center border-dashed border-muted bg-background">
				<div className="h-[90%] aspect-square overflow-x-hidden flex items-center justify-center border-dashed border-muted border-2 p-2 rounded-xl">
					<QRCode
						className="h-full"
						bgColor="hsl(var(--background))"
						fgColor="hsl(var(--primary))"
						value={qrPayload}
					/>
				</div>
			</div>
		</div>
	);
}