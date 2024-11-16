"use server";

import { z } from "zod";
import { adminAction } from "@/lib/safe-action";
import { Redis } from "@upstash/redis";
import { revalidatePath } from "next/cache";

const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL,
	token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const defaultRegistrationToggleSchema = z.object({
	enabled: z.boolean(),
});

export const toggleRegistrationEnabled = adminAction
	.schema(defaultRegistrationToggleSchema)
	.action(async ({ parsedInput: { enabled }, ctx: { user, userId } }) => {
		await redis.set("config:registration:registrationEnabled", enabled);
		revalidatePath("/admin/toggles/registration");
		return { success: true, statusSet: enabled };
	});

export const toggleRegistrationMessageEnabled = adminAction
	.schema(defaultRegistrationToggleSchema)
	.action(async ({ parsedInput: { enabled }, ctx: { user, userId } }) => {
		await redis.set("config:registration:registrationMessageEnabled", enabled);
		revalidatePath("/admin/toggles/registration");
		return { success: true, statusSet: enabled };
	});

export const toggleSecretRegistrationEnabled = adminAction
	.schema(defaultRegistrationToggleSchema)
	.action(async ({ parsedInput: { enabled }, ctx: { user, userId } }) => {
		await redis.set("config:registration:secretRegistrationEnabled", enabled);
		revalidatePath("/admin/toggles/registration");
		return { success: true, statusSet: enabled };
	});

export const toggleRSVPs = adminAction
	.schema(defaultRegistrationToggleSchema)
	.action(async ({ parsedInput: { enabled }, ctx: { user, userId } }) => {
		await redis.set("config:registration:allowRSVPs", enabled);
		revalidatePath("/admin/toggles/registration");
		return { success: true, statusSet: enabled };
	});
