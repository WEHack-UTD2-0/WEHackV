"use client";

import { useWindowSize } from "usehooks-ts";
import Confetti from "react-confetti";
import { Button } from "@/components/shadcn/ui/button";
import { useState, useEffect } from "react";
import { useAction } from "next-safe-action/hook";
import { rsvpMyself } from "@/actions/rsvp";
import { CheckCircleIcon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ConfirmDialogue({ hasRsvped }: { hasRsvped: boolean }) {
	const [showConfetti, setShowConfetti] = useState(false);
	const { width = 0, height = 0 } = useWindowSize();
	const router = useRouter();

	const { execute } = useAction(rsvpMyself, {
		onSuccess: () => {
			toast.dismiss();
			router.refresh();
		},
	});

	useEffect(() => {
		if (hasRsvped) {
			setShowConfetti(true);
		}
	}, [hasRsvped]);

	return (
		<>
			{showConfetti && (
				<Confetti
					onConfettiComplete={() => setShowConfetti(false)}
					recycle={false}
					run={showConfetti}
					numberOfPieces={200}
					width={width}
					height={height}
				/>
			)}
			{hasRsvped ? (
				<div className="relative flex aspect-video w-96 max-w-[500px] flex-col items-center justify-center rounded-xl bg-[#992444] p-5 backdrop-blur transition dark:bg-white/[0.08]">
					<h1 className="flex items-center gap-x-2 text-2xl font-bold text-[#A6CDC4]">
						<CheckCircleIcon />
						You have RSVPed!
					</h1>
					<p className="pb-10 pt-5">
						We can't wait to see you at the event!
					</p>
					<Link href={"/dash"}>
						<Button className="bg-[#D09C51] hover:bg-[#CCBA97]">Go To Dashboard</Button>
					</Link>
				</div>
			) : (
				<div className="relative flex aspect-video w-full max-w-[500px] flex-col items-center justify-center rounded-xl backdrop-blur transition dark:bg-white/[0.08] pb-60">
					<p className="absolute bottom-0 px-10 pb-40 text-center text-sm text-[#F03C2D]">
						Make sure you only RSVP if you are certain you can
						attend the event!
					</p>
					<Button
						onClick={() => {
							execute(null);
							toast.loading("Confirming your RSVP...", {
								duration: 0,
							});
						}}
						size={"lg"}
						className="font-bold bg-[#D09C51] hover:bg-[#CCBA97]"
					>
						Confirm RSVP
					</Button>
				</div>
			)}
		</>
	);
}
