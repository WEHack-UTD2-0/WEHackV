"use server";

import { z } from "zod";
import { adminAction } from "@/lib/safe-action";
import { Redis } from "@upstash/redis";
import { revalidatePath } from "next/cache";

const metadataSchema = z.object({
	name: z.string().min(1),
	url: z.string(),
});

const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL,
	token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
  

// Maybe a better way to do this for revalidation? Who knows.
const navAdminPage = "/admin/toggles/landing";

export const setItem = adminAction(
	metadataSchema,
	async ({ name, url }, { user, userId }) => {
		await redis.sadd("config:navitemslist", encodeURIComponent(name));
		await redis.hset(`config:navitems:${encodeURIComponent(name)}`, {
			url,
			name,
			enabled: true,
		});
		revalidatePath(navAdminPage);
		return { success: true };
	},
);

export const removeItem = adminAction(
	z.string(),
	async (name, { user, userId }) => {
		const pipe = redis.pipeline();
		pipe.srem("config:navitemslist", encodeURIComponent(name));
		pipe.del(`config:navitems:${encodeURIComponent(name)}`);
		await pipe.exec();
		// await new Promise((resolve) => setTimeout(resolve, 1500));
		revalidatePath(navAdminPage);
		return { success: true };
	},
);

export const toggleItem = adminAction(
	z.object({ name: z.string(), statusToSet: z.boolean() }),
	async ({ name, statusToSet }, { user, userId }) => {
		await redis.hset(`config:navitems:${encodeURIComponent(name)}`, {
			enabled: statusToSet,
		});
		revalidatePath(navAdminPage);
		return { success: true, itemStatus: statusToSet };
	},
);
