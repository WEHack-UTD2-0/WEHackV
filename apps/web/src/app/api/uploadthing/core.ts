// import { createUploadthing, type FileRouter } from "uploadthing/next";
// import { UploadThingError } from "uploadthing/server";
// import { auth } from "@clerk/nextjs";

// const f = createUploadthing();

// // const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// // FileRouter for your app, can contain multiple FileRoutes
// export const ourFileRouter = {
// 	// PDF UPLOADER
// 	pdfUploaderPublic: f({ pdf: { maxFileSize: "4MB", maxFileCount: 1 } })
// 		// Set permissions and file types for this FileRoute
// 		.middleware(async ({ req }) => {
// 			// This code runs on your server before upload
// 			// const user = await auth(req);
// 			if (process.env.UPLOADTHING_TOKEN) {
// 				console.log("inside public middleware: existing")
// 			} else {
// 				console.log("inside NOT existing in public middleware")
// 			}
// 			// If you throw, the user will not be able to upload
// 			// if (!user) throw new UploadThingError("Unauthorized");
// 			// console.log(req);
// 			const testing = await req.json();
// 			console.log(testing);
// 			// throw new UploadThingError("Testing");
// 			// Whatever is returned here is accessible in onUploadComplete as `metadata`
// 			// return { userId: user.id };
// 			console.log("Public route: No authentication required");
// 			return {};
// 		})
// 		.onUploadError(async ({ error, fileKey }) => {
// 			// This code RUNS ON YOUR SERVER after upload
// 			console.log(error);
// 		})
// 		.onUploadComplete(async ({ metadata, file }) => {
// 			console.log("Public upload complete");
// 			console.log("File URL:", file.url);
// 			return { fileUrl: file.url };
// 		}),


// 	pdfUploaderPrivate: f({ pdf: { maxFileSize: "4MB", maxFileCount: 1 } })
// 	// Set permissions and file types for this FileRoute
// 		.middleware(async ({ req }) => {
// 			const { userId } = auth();

// 			if (!userId) {
// 			  throw new UploadThingError("You need to be logged in to upload files");
// 			}

// 			if (process.env.UPLOADTHING_TOKEN) {
// 				console.log("inside private middleware: existing")
// 			} else {
// 				console.log("inside NOT existing in private middleware")
// 			}

// 			const testing = await req.json();
// 			console.log(testing);
	  
// 			return { userId: userId };
// 		})
// 		.onUploadComplete(async ({ metadata, file }) => {
// 			// This code RUNS ON YOUR SERVER after upload
// 			console.log("Upload complete for userId:", metadata.userId);

// 			console.log("file url", file.url);

// 			// !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
// 			return { uploadedBy: metadata.userId, fileUrl:file.url };
// 		}),
// } satisfies FileRouter;

// export type OurFileRouter = typeof ourFileRouter;

import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
// import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
	// PDF UPLOADER
	pdfUploader: f({ pdf: { maxFileSize: "4MB", maxFileCount: 1 } })
		// Set permissions and file types for this FileRoute
		.middleware(async ({ req }) => {
			// This code runs on your server before upload
			const user = await auth(req);
			// If you throw, the user will not be able to upload
			if (!user) throw new UploadThingError("Unauthorized");
			// Whatever is returned here is accessible in onUploadComplete as `metadata`
			return { userId: user.id };
		})
		.onUploadError(async ({ error, fileKey }) => {
			// This code RUNS ON YOUR SERVER after upload
			console.log(error);

			console.log(fileKey);

			// !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
			// return { uploadedBy: metadata.userId };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			// This code RUNS ON YOUR SERVER after upload
			console.log("Upload complete for userId:", metadata.userId);

			console.log("file url", file.url);

			// !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
			return { uploadedBy: metadata.userId, fileUrl:file.url};
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;


