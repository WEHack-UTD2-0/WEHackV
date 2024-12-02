import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getAuth } from "@clerk/nextjs/server";

const f = createUploadthing();

// const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
	// PDF UPLOADER
	pdfUploaderPrivate: f({ pdf: { maxFileSize: "4MB", maxFileCount: 1, minFileCount: 1} })
	// Set permissions and file types for this FileRoute
		.middleware(async ({ req }) => {
			const { userId } = getAuth(req);

			if (!userId) {
			  throw new UploadThingError("You need to be logged in to upload files");
			}

			if (process.env.UPLOADTHING_TOKEN) {
				console.log("inside private middleware: existing")
			} else {
				console.log("inside NOT existing in private middleware")
			}

			const testing = await req.json();
			console.log(testing);
	  
			return { userId: userId };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			// This code RUNS ON YOUR SERVER after upload
			console.log("Upload complete for userId:", metadata.userId);

			console.log("file url", file.url);

			// !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
			return { uploadedBy: metadata.userId, fileUrl:file.url };
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

// import { createUploadthing, type FileRouter } from "uploadthing/next";
// import { UploadThingError } from "uploadthing/server";
// // import { auth } from "@clerk/nextjs/server";

// const f = createUploadthing();

// const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// // FileRouter for your app, can contain multiple FileRoutes
// export const ourFileRouter = {
// 	// PDF UPLOADER
// 	pdfUploader: f({ pdf: { maxFileSize: "4MB", maxFileCount: 1 } })
// 		// Set permissions and file types for this FileRoute
// 		.middleware(async ({ req }) => {
// 			// This code runs on your server before upload
// 			const user = await auth(req);
// 			// If you throw, the user will not be able to upload
// 			if (!user) throw new UploadThingError("Unauthorized");
// 			// Whatever is returned here is accessible in onUploadComplete as `metadata`
// 			return { userId: user.id };
// 		})
// 		.onUploadError(async ({ error, fileKey }) => {
// 			// This code RUNS ON YOUR SERVER after upload
// 			console.log(error);

// 			console.log(fileKey);

// 			// !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
// 			// return { uploadedBy: metadata.userId };
// 		})
// 		.onUploadComplete(async ({ metadata, file }) => {
// 			// This code RUNS ON YOUR SERVER after upload
// 			console.log("Upload complete for userId:", metadata.userId);

// 			console.log("file url", file.url);

// 			// !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
// 			return { uploadedBy: metadata.userId, fileUrl:file.url};
// 		}),
// } satisfies FileRouter;

// export type OurFileRouter = typeof ourFileRouter;


