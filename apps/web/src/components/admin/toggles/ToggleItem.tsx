"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface ToggleItemProps {
	name: string;
	path: string;
}

export default function ToggleItem({ name, path }: ToggleItemProps) {
	const currPath = usePathname();
	return (
		<Link href={path}>
			<div
				className={`w-full rounded px-2 py-3 transition-all duration-100 hover:bg-accent hover:text-accent-foreground ${
					(currPath.startsWith(path) &&
						path !== "/admin" &&
						path !== "/dash" &&
						path !== "/admin/toggles") ||
					currPath === path
						? "text-primary"
						: "text-muted-foreground"
				}`}
			>
				<p className="text-sm text-white">{name}</p>
			</div>
		</Link>
	);
}
