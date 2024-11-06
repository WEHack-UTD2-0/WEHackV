import Link from "next/link";
import Image from "next/image";
import c from "config";
import { Button } from "../shadcn/ui/button";
import ProfileButton from "./ProfileButton";
import { auth, currentUser } from "@clerk/nextjs";
import NavBarLinksGrouper from "./NavBarLinksGrouper";
import { Oswald } from "next/font/google";
import { cn } from "@/lib/utils/client/cn";
import { getUser } from "db/functions";
import './Nav.css'

const oswald = Oswald({
	variable: "--font-oswald",
	subsets: ["latin"],
});

interface NavbarProps {
	className?: string;
}

export default async function Navbar({ className }: NavbarProps) {
	const user = await currentUser();
	const registrationIsComplete =
		user != null && (await getUser(user.id)) != undefined;
	return (
		<div className="z-50 w-screen fixed pt-6">
			<div
				className={cn(
					`relative top-0 z-50 h-16 w-screen`,
					className,
				)}
			>
				<div className="mx-auto grid h-full w-full max-w-7xl grid-flow-col grid-cols-2 px-2 sm:px-6 lg:max-w-full lg:px-8">
					<div className="col-span-3 flex items-center justify-start gap-x-5 pl-4 md:pl-0">
						<Link
							href={"/"}
							className="mr-5 flex items-center gap-x-2"
						>
							<Image
								src={"/static/images/LogoSparkle.png"}
								alt={c.hackathonName + " Logo"}
								width={60}
								height={60}
							/>
						</Link>
					</div>

					<div className="flex items-center justify-between space-x-2 md:justify-center pr-20 md:pr-32">
						<div className="col-span-2 hidden items-center justify-end gap-x-5 md:flex md:pr-10">
							{/* <NavBarLinksGrouper /> */}
							<a className='text-lg lg:text-base font-medium' href="#about-wehack">About</a>
                        	<a className='text-lg lg:text-base font-medium' href="#FAQ">FAQ</a>
                        	<a className='text-lg lg:text-base font-medium' href="http://hackp.ac/coc" target="_blank">MLH Conduct</a>
						</div>
						<div className="hidden gap-x-4 md:flex">
							{user ? (
								<>
									<Link
										href={
											registrationIsComplete
												? "/dash"
												: "/register"
										}
									>
										<Button
											className="primary-btn bg-[#909634] text-[#FFE9D7] w-full py-3 px-5 hover:bg-[#909634]"
										>
											{registrationIsComplete
												? "Dashboard"
												: "Complete Registration"}
										</Button>
									</Link>
								</>
							) : (
								<>
									<Link href={"/sign-in"}>
										<Button
											className="primary-btn bg-[#909634] text-[#FFE9D7] w-full py-3 px-5 hover:bg-[#909634]"
										>
											Sign In
										</Button>
									</Link>
									<Link href={"/register"}>
										<Button
											className="primary-btn bg-[#909634] text-[#FFE9D7] w-full py-3 px-5 hover:bg-[#909634]"
										>Register</Button>
									</Link>
								</>
							)}
						</div>
						<div className="relative">
							<ProfileButton />
						</div>
						
					</div>
				</div>
			</div>
		</div>
	);
}

export const runtime = "edge";
