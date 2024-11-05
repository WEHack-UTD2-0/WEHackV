import c from "config";
import Image from "next/image";
import { auth } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/shadcn/ui/button";
import DashNavItem from "@/components/dash/shared/DashNavItem";
import FullScreenMessage from "@/components/shared/FullScreenMessage";
import ProfileButton from "@/components/shared/ProfileButton";
import { Suspense } from "react";
import ClientToast from "@/components/shared/ClientToast";
import { redirect } from "next/navigation";
import { getUser } from "db/functions";

interface AdminLayoutProps {
	children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
	const { userId } = auth();

	if (!userId) {
		return redirect("/sign-in");
	}

	const user = await getUser(userId);

	if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
		console.log("Denying admin access to user", user);
		return (
			<FullScreenMessage
				title="Access Denied"
				message="You are not an admin. If you belive this is a mistake, please contact a administrator."
			/>
		);
	}

	return (
		<>
			<ClientToast />
			<div className="relative top-0 z-20 grid h-16 w-full grid-cols-2 bg-nav px-5">
				<div className="flex items-center gap-x-4">
					<Image
						src={"/static/images/LogoSparkle.png"}
						alt={c.hackathonName + " Logo"}
						width={32}
						height={32}
					/>
					<div className="h-[45%] w-[2px] rotate-[25deg] bg-muted-foreground" />
					<h2 className="font-bold tracking-tight">Admin</h2>
				</div>
				<div className="items-center justify-end gap-x-4 flex pt-6 md:pt-0">
					<div className="hidden items-center justify-end gap-x-4 md:flex">
						<Link href={"/"}>
							<Button
								variant={"outline"}
								className="bg-nav hover:bg-[#D09C51]"
							>
								Home
							</Button>
						</Link>
						{/* <Link href={c.links.guide}>
							<Button
								variant={"outline"}
								className="bg-nav hover:bg-[#D09C51]"
							>
								Survival Guide
							</Button>
						</Link> */}
						<Link href={c.links.discord}>
							<Button
								variant={"outline"}
								className="bg-nav hover:bg-[#D09C51]"
							>
								Discord
							</Button>
						</Link>
						
					</div>
					<div className='-mt-4 md:-mt-0'><ProfileButton /></div>
					
				</div>
				<div className="flex items-center justify-end gap-x-4 md:hidden"></div>
			</div>
			<div className="z-20 flex h-12 w-full border-b border-b-border bg-nav px-5">
				{Object.entries(c.dashPaths.admin).map(([name, path]) => (
					<DashNavItem key={name} name={name} path={path} />
				))}
			</div>
			<Suspense fallback={<p>Loading...</p>}>{children}</Suspense>
		</>
	);
}

export const runtime = "edge";
