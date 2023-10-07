import type { Config } from "drizzle-kit";
import "dotenv/config";

export default {
	schema: "./src/db/schema.ts",
	out: "./drizzle",
	driver: "pg",
	dbCredentials: {
		connectionString: `${process.env.DB_URL as string}&ssl={"rejectUnauthorized":true}`,
	},
	breakpoints: true,
} satisfies Config;
