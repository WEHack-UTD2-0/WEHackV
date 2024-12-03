"use client";
import { useForm } from "react-hook-form";
import {
	Form,
	FormItem,
	FormControl,
	FormDescription,
	FormMessage,
	FormLabel,
	FormField,
} from "@/components/shadcn/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	SelectGroup,
} from "@/components/shadcn/ui/select";
import { Input } from "@/components/shadcn/ui/input";
import { Button } from "@/components/shadcn/ui/button";
import { z } from "zod";
import { RegisterFormValidator } from "@/validators/shared/RegisterForm";
import { zodResolver } from "@hookform/resolvers/zod";
import FormGroupWrapper from "./FormGroupWrapper";
import { Checkbox } from "@/components/shadcn/ui/checkbox";
import Link from "next/link";
import c from "config";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/shadcn/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/shadcn/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils/client/cn";
import { useEffect, useCallback, useState } from "react";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { zpostSafe } from "@/lib/utils/client/zfetch";
import { useAuth } from "@clerk/nextjs";
import { BasicServerValidator } from "@/validators/shared/basic";
import { useRouter } from "next/navigation";
import { FileRejection, useDropzone } from "react-dropzone";
import { put, type PutBlobResult } from "@vercel/blob";
import { Tag, TagInput } from "@/components/shadcn/ui/tag/tag-input";
import CreatingRegistration from "./CreatingRegistration";
import { bucketResumeBaseUploadUrl } from "config";
import { count } from "console";

import { UploadDropzone } from "@/utils/uploadthing";
import "@uploadthing/react/styles.css"; // drop zone styling
import { useUploadThing } from "@/utils/uploadthing";
import { NodeNextRequest } from "next/dist/server/base-http/node";
import { Sonsie_One } from "next/font/google";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { generatePermittedFileTypes } from "uploadthing/client";
import { UploadedFileData, type FileRouter } from "uploadthing/types";

interface RegisterFormProps {
	defaultEmail: string;
}

export default function RegisterForm({ defaultEmail }: RegisterFormProps) {
	const [resumeFile, setResumeFile] = useState<File | null>(null);

	const { startUpload, routeConfig } = useUploadThing("pdfUploaderPrivate"); // Specify your endpoint

	const { isLoaded, userId } = useAuth();
	const router = useRouter();

	const form = useForm<z.infer<typeof RegisterFormValidator>>({
		resolver: zodResolver(RegisterFormValidator),
		defaultValues: {
			email: defaultEmail,
			hackathonsAttended: 0,
			dietaryRestrictions: [],
			profileIsSearchable: true,
			bio: "",
			isEmailable: false,
			// The rest of these are default values to prevent the controller / uncontrolled input warning from React
			hasAcceptedMLHCoC: false,
			hasSharedDataWithMLH: false,
			accommodationNote: "",
			firstName: "",
			lastName: "",
			age: 0,
			ethnicity: "" as any,
			gender: "" as any,
			major: "",
			github: "",
			hackerTag: "",
			heardAboutEvent: "" as any,
			levelOfStudy: "" as any,
			linkedin: "",
			personalWebsite: "",
			profileDiscordName: "",
			pronouns: "",
			race: "" as any,
			shirtSize: "" as any,
			// schoolID: "",
			university: "",
			phoneNumber: "",
			countryOfResidence: "",
			questionOne: "",
			questionTwo: "",
			questionThree: "",
			uploadedFile: undefined,
		},
	});

	const { isSubmitSuccessful, isSubmitted, errors } = form.formState;

	const hasErrors = !isSubmitSuccessful && isSubmitted;

	const [uploadedFile, setUploadedFile] = useState<File | null>(null);
	const [skills, setSkills] = useState<Tag[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const universityValue = form.watch("university");
	const bioValue = form.watch("bio");
	const question1 = form.watch("questionOne");
	const question2 = form.watch("questionTwo");
	const question3 = form.watch("questionThree");
	const countryValue = form.watch("countryOfResidence");

	// useEffect(() => {
	// 	if (universityValue != c.localUniversityName) {
	// 		form.setValue("schoolID", "NOT_LOCAL_SCHOOL");
	// 	} else {
	// 		form.setValue("schoolID", "");
	// 	}
	// }, [universityValue]);

	useEffect(() => {
		console.log(countryValue);
	}, [countryValue]);

	useEffect(() => {
		console.log("Resume file updated:", resumeFile);
	}, [resumeFile]);

	async function onSubmit(data: z.infer<typeof RegisterFormValidator>) {
		console.log(data);
		setIsLoading(true);
		if (!userId || !isLoaded) {
			setIsLoading(false);
			return alert(
				`Auth has not loaded yet. Please try again! If this is a repeating issue, please contact us at ${c.issueEmail}.`,
			);
		}

		if (
			data.hasAcceptedMLHCoC !== true ||
			data.hasSharedDataWithMLH !== true
		) {
			setIsLoading(false);
			return alert(
				"You must accept the MLH Code of Conduct and Privacy Policy to continue.",
			);
		}

		let resume: string = c.noResumeProvidedURL;

		if (resumeFile) {
			// const { startUpload, routeConfig } = useUploadThing("pdfUploader"); // Specify your endpoint
			const uploadResult = await startUpload([resumeFile]); // Pass the resumeFile as an array
			console.log("results", uploadResult);

			if (uploadResult) {
				// Extract the uploaded file information (URL, etc.)
				const {serverData: {
					fileUrl,
					uploadedBy
					
				}} = uploadResult[0];

				// const uploadedFileData = uploadResult[0];
				// console.log(UploadedFileData)
				// console.log(fileUrl);
				// console.log(uploadResult[0].serverData);
				resume = fileUrl;

				// Proceed with form submission by including the uploaded resume URL
				const res = await zpostSafe({
					url: "/api/registration/create",
					body: { ...data, resume }, // Add the resume URL to the form data
					vRes: BasicServerValidator,
				});

				if (res.success) {
					if (res.data.success) {
						alert(
							"Registration successfully created! Redirecting to the dashboard.",
						);
						router.push("/dash");
					} else {
						if (res.data.message == "hackertag_not_unique") {
							setIsLoading(false);
							return alert(
								"The HackerTag you chose has already been taken. Please change it and then resubmit the form.",
							);
						}
						setIsLoading(false);
						return alert(
							`Registration not created. Error message: \n\n ${res.data.message} \n\n Please try again. If this is a continuing issue, please reach out to us at ${c.issueEmail}.`,
						);
					}
				} else {
					setIsLoading(false);
					alert(
						`Something went wrong while attempting to register. Please try again. If this is a continuing issue, please reach out to us at ${c.issueEmail}.`,
					);
					return console.log(
						`Recieved a unexpected response from the server. Please try again. If this is a continuing issue, please reach out to us at ${c.issueEmail}.`,
					);
				}
			}
		} else {
			setIsLoading(false);
			alert(`Please upload a resume`);
			return console.log(`User has not uploaded a resume`);
		}

		// const res = await zpostSafe({
		// 	url: "/api/registration/create",
		// 	body: { ...data, resume },
		// 	vRes: BasicServerValidator,
		// });

		// if (res.success) {
		// 	if (res.data.success) {
		// 		alert(
		// 			"Registration successfully created! Redirecting to the dashboard.",
		// 		);
		// 		router.push("/dash");
		// 	} else {
		// 		if (res.data.message == "hackertag_not_unique") {
		// 			setIsLoading(false);
		// 			return alert(
		// 				"The HackerTag you chose has already been taken. Please change it and then resubmit the form.",
		// 			);
		// 		}
		// 		setIsLoading(false);
		// 		return alert(
		// 			`Registration not created. Error message: \n\n ${res.data.message} \n\n Please try again. If this is a continuing issue, please reach out to us at ${c.issueEmail}.`,
		// 		);
		// 	}
		// } else {
		// 	setIsLoading(false);
		// 	alert(
		// 		`Something went wrong while attempting to register. Please try again. If this is a continuing issue, please reach out to us at ${c.issueEmail}.`,
		// 	)
		// 	return console.log(
		// 		`Recieved a unexpected response from the server. Please try again. If this is a continuing issue, please reach out to us at ${c.issueEmail}.`,
		// 	);
		// }
	}

	const onDrop = useCallback(
		(acceptedFiles: File[], fileRejections: FileRejection[]) => {
			if (fileRejections.length > 0) {
				alert(
					`The file you uploaded was rejected with the reason "${fileRejections[0].errors[0].message}". Please try again.`,
				);
			}
			if (acceptedFiles.length > 0) {
				console.log("testing")
				setResumeFile(acceptedFiles[0]);
				form.setValue("uploadedFile", acceptedFiles[0])
			}
		},
		[],
	);

	const currentFile = form.watch("uploadedFile")

	useEffect(()=>{
		console.log("file:",currentFile);
	},[currentFile])



	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: generateClientDropzoneAccept(
			generatePermittedFileTypes(routeConfig).fileTypes,
		),
	});
	// const { getRootProps, getInputProps, isDragActive } = useDropzone({
	// 	onDrop,
	// 	multiple: false,
	// 	accept: { "application/pdf": [".pdf"] },
	// 	maxSize: c.maxResumeSizeInBytes,
	// 	noClick: resumeFile != null,
	// 	noDrag: resumeFile != null,
	// });

	if (isLoading) {
		return <CreatingRegistration />;
	}

	return (
		<div>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-16"
				>
					<FormGroupWrapper title="General">
						<div className="grid grid-cols-1 gap-x-2 gap-y-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex flex-row gap-x-2">
											First Name{" "}
											<p className="text-[#F03C2D]">*</p>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="John"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="lastName"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex flex-row gap-x-2">
											Last Name{" "}
											<p className="text-[#F03C2D]">*</p>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Doe"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex flex-row gap-x-2">
											Email{" "}
											<p className="text-[#F03C2D]">*</p>
										</FormLabel>
										<FormControl>
											<Input
												readOnly={
													defaultEmail.length > 0
												}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="phoneNumber"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex flex-row gap-x-2">
											Phone Number{" "}
											<p className="text-[#F03C2D]">*</p>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="555-555-5555"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="grid grid-cols-1 gap-x-2 gap-y-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="age"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex flex-row gap-x-2">
											Age{" "}
											<p className="text-[#F03C2D]">*</p>
										</FormLabel>
										<FormControl>
											<Input type="number" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="gender"
								render={({ field }) => (
									<FormItem className="">
										<FormLabel className="flex flex-row gap-x-2">
											Gender{" "}
											<p className="text-[#F03C2D]">*</p>
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Select a Gender" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectGroup>
													<SelectItem value="MALE">
														Male
													</SelectItem>
													<SelectItem value="FEMALE">
														Female
													</SelectItem>
													<SelectItem value="NON-BINARY">
														Non-binary
													</SelectItem>
													<SelectItem value="OTHER">
														Other
													</SelectItem>
													<SelectItem value="PREFERNOTSAY">
														Prefer not to say
													</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="race"
								render={({ field }) => (
									<FormItem className="">
										<FormLabel className="flex flex-row gap-x-2">
											Race{" "}
											<p className="text-[#F03C2D]">*</p>
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Select a Race" />
												</SelectTrigger>
											</FormControl>
											<SelectContent className="max-h-72 overflow-y-scroll">
												<SelectGroup>
													{c.registration.raceOptions.map(
														(option) => (
															<SelectItem
																value={option}
																key={option}
															>
																{option}
															</SelectItem>
														),
													)}
												</SelectGroup>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="ethnicity"
								render={({ field }) => (
									<FormItem className="">
										<FormLabel className="flex flex-row gap-x-2">
											Ethnicity{" "}
											<p className="text-[#F03C2D]">*</p>
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger className="w-full placeholder:text-muted-foreground">
													<SelectValue placeholder="Select a Ethnicity" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectGroup>
													<SelectItem value="Hispanic or Latino">
														Hispanic or Latino
													</SelectItem>
													<SelectItem value="Not Hispanic or Latino">
														Not Hispanic or Latino
													</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="countryOfResidence"
								render={({ field }) => (
									<FormItem className="grid-cols-2">
										<FormLabel className="flex flex-row gap-x-2">
											Country of Residence{" "}
											<p className="text-[#F03C2D]">*</p>
										</FormLabel>
										<div className="flex w-full items-center justify-center">
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant="outline"
															role="combobox"
															className={cn(
																"w-full justify-between",
																!field.value &&
																	"text-muted-foreground",
															)}
														>
															{field.value
																? c.registration.countries.find(
																		(
																			selectedCountry,
																		) =>
																			selectedCountry.code ===
																			field.value,
																	)?.name
																: "Select a Country"}
															<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className="no-scrollbar max-h-[400px] w-[250px] overflow-y-auto p-0">
													<Command>
														<CommandInput placeholder="Search countries..." />
														<CommandList>
															<CommandEmpty>
																No country
																found.
															</CommandEmpty>
															<CommandGroup>
																{c.registration.countries.map(
																	(
																		country,
																	) => (
																		<CommandItem
																			value={
																				country.name
																			}
																			key={
																				country.name
																			}
																			onSelect={(
																				_,
																			) => {
																				const countryResult =
																					c.registration.countries.find(
																						(
																							countryObject,
																						) =>
																							countryObject.name ===
																							country.name,
																					);
																				form.setValue(
																					"countryOfResidence",
																					countryResult?.code ??
																						"00",
																				);
																			}}
																			className="cursor-pointer"
																		>
																			<Check
																				className={`mr-2 h-4 w-4 ${
																					country.name.toLowerCase() ===
																					field.value
																						? "block"
																						: "hidden"
																				} `}
																			/>
																			{
																				country.name
																			}
																		</CommandItem>
																	),
																)}
															</CommandGroup>
														</CommandList>
													</Command>
												</PopoverContent>
											</Popover>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</FormGroupWrapper>
					<FormGroupWrapper title="MLH">
						<FormField
							control={form.control}
							name="hasAcceptedMLHCoC"
							render={({ field }) => (
								<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>
											I accept the{" "}
											<Link
												target="_blank"
												className="underline"
												href={
													"https://mlh.io/code-of-conduct"
												}
											>
												MLH Code of Conduct
											</Link>
										</FormLabel>
										<FormDescription>
											This is required of all attendees.
										</FormDescription>
									</div>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="hasSharedDataWithMLH"
							render={({ field }) => (
								<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>
											I authorize you to share my
											application/registration information
											with Major League Hacking for event
											administration, ranking, and MLH
											administration in-line with the MLH
											Privacy Policy. I further agree to
											the terms of both the{" "}
											<Link
												target="_blank"
												className="underline"
												href={
													"https://github.com/MLH/mlh-policies/blob/main/contest-terms.md"
												}
											>
												MLH Contest Terms and Conditions
											</Link>{" "}
											and the{" "}
											<Link
												target="_blank"
												className="underline"
												href={"https://mlh.io/privacy"}
											>
												MLH Privacy Policy
											</Link>
											.
										</FormLabel>
										<FormDescription>
											This is required of all attendees.
										</FormDescription>
									</div>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="isEmailable"
							render={({ field }) => (
								<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>
											I authorize MLH to send me an email
											where I can further opt into the MLH
											Hacker, Events, or Organizer
											Newsletters and other communications
											from MLH.
										</FormLabel>
										<FormDescription>
											This is optional.
										</FormDescription>
									</div>
								</FormItem>
							)}
						/>
					</FormGroupWrapper>
					<FormGroupWrapper title="University Info">
						<div
							className={`grid ${
								universityValue ===
								c.localUniversityName.toLowerCase()
									? "grid-cols-1 md:grid-cols-6"
									: "grid-cols-1 md:grid-cols-5"
							} gap-x-2 gap-y-4`}
						>
							<FormField
								control={form.control}
								name="university"
								render={({ field }) => (
									<FormItem className="col-span-2 flex flex-col">
										<FormLabel className="flex flex-row gap-x-2">
											University{" "}
											<p className="text-[#F03C2D]">*</p>
										</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant="outline"
														role="combobox"
														className={cn(
															"w-full justify-between",
															!field.value &&
																"text-muted-foreground",
														)}
													>
														{field.value
															? c.registration.schools.find(
																	(school) =>
																		school ===
																		field.value,
																)
															: "Select a University"}
														<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="no-scrollbar max-h-[400px] w-[250px] overflow-y-auto p-0">
												<Command>
													<CommandInput placeholder="Search university..." />
													<CommandList>
														<CommandEmpty>
															No university found.
														</CommandEmpty>
														<CommandGroup>
															{c.registration.schools.map(
																(school) => (
																	<CommandItem
																		value={
																			school
																		}
																		key={
																			school
																		}
																		onSelect={(
																			value,
																		) => {
																			form.setValue(
																				"university",
																				value,
																			);
																		}}
																		className="cursor-pointer"
																	>
																		<Check
																			className={`mr-2 h-4 w-4 ${
																				school.toLowerCase() ===
																				field.value
																					? "block"
																					: "hidden"
																			} `}
																		/>
																		{school}
																	</CommandItem>
																),
															)}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="major"
								render={({ field }) => (
									<FormItem className="col-span-2 flex flex-col">
										<FormLabel className="flex flex-row gap-x-2">
											Major{" "}
											<p className="text-[#F03C2D]">*</p>
										</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant="outline"
														role="combobox"
														className={cn(
															"w-full justify-between",
															!field.value &&
																"text-muted-foreground",
														)}
													>
														{field.value
															? c.registration.majors.find(
																	(major) =>
																		major ===
																		field.value,
																)
															: "Select a Major"}
														<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="no-scrollbar max-h-[400px] w-[250px] overflow-y-auto p-0">
												<Command>
													<CommandInput placeholder="Search major..." />
													<CommandList>
														<CommandEmpty>
															No major found.
														</CommandEmpty>
														<CommandGroup>
															{c.registration.majors.map(
																(major) => (
																	<CommandItem
																		value={
																			major
																		}
																		key={
																			major
																		}
																		onSelect={(
																			value,
																		) => {
																			form.setValue(
																				"major",
																				value,
																			);
																		}}
																		className="cursor-pointer"
																	>
																		<Check
																			className={`mr-2 h-4 w-4 overflow-hidden ${
																				major.toLowerCase() ===
																				field.value
																					? "block"
																					: "hidden"
																			} `}
																		/>
																		{major}
																	</CommandItem>
																),
															)}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="levelOfStudy"
								render={({ field }) => (
									<FormItem className="col-span-2 flex flex-col md:col-span-1">
										<FormLabel className="flex flex-row gap-x-2">
											Level of Study{" "}
											<p className="text-[#F03C2D]">*</p>
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger className="w-full placeholder:text-muted-foreground">
													<SelectValue placeholder="Level of Study" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectGroup>
													<SelectItem value="Freshman">
														Freshman
													</SelectItem>
													<SelectItem value="Sophomore">
														Sophomore
													</SelectItem>
													<SelectItem value="Junior">
														Junior
													</SelectItem>
													<SelectItem value="Senior">
														Senior
													</SelectItem>
													<SelectItem value="Master's">
														Master's
													</SelectItem>
													<SelectItem value="PhD">
														PhD
													</SelectItem>
													<SelectItem value="High School - 18 years old">
														High School - 18 years old
													</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							{/* <FormField
								control={form.control}
								name="schoolID"
								render={({ field }) => (
									<FormItem
										className={`${
											universityValue ===
											c.localUniversityName
												? "col-span-2 flex flex-col md:col-span-1"
												: "hidden"
										}`}
									>
										<FormLabel>
											{c.localUniversitySchoolIDName}
										</FormLabel>
										<FormControl>
											<Input
												placeholder={
													c.localUniversitySchoolIDName
												}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/> */}
						</div>
					</FormGroupWrapper>
					<FormGroupWrapper title="Hackathon Experience">
						<div className="grid grid-cols-1 gap-x-2 gap-y-2 md:grid-cols-3 md:gap-y-0">
							<FormField
								control={form.control}
								name="hackathonsAttended"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex flex-row gap-x-2">
											# of Hackathons Attended{" "}
											<p className="text-[#F03C2D]">*</p>
										</FormLabel>
										<FormControl>
											<Input type="number" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="softwareBuildingExperience"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex flex-row gap-x-2">
											Software Building Experience{" "}
											<p className="text-[#F03C2D]">*</p>
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger className="w-full placeholder:text-muted-foreground">
													<SelectValue placeholder="Experience Level" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectGroup>
													<SelectItem value="Beginner">
														Beginner
													</SelectItem>
													<SelectItem value="Intermediate">
														Intermediate
													</SelectItem>
													<SelectItem value="Advanced">
														Advanced
													</SelectItem>
													<SelectItem value="Expert">
														Expert
													</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="heardAboutEvent"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex flex-row gap-x-2">
											Where did you hear about{" "}
											{c.hackathonName}?{" "}
											<p className="text-[#F03C2D]">*</p>
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger className="w-full placeholder:text-muted-foreground">
													<SelectValue placeholder="Heard From..." />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectGroup>
													<SelectItem value="Instagram">
														Instagram
													</SelectItem>
													<SelectItem value="Class Presentation">
														Class Presentation
													</SelectItem>
													<SelectItem value="Twitter">
														Twitter
													</SelectItem>
													<SelectItem value="Event Site">
														Event Site
													</SelectItem>
													<SelectItem value="Friend">
														Friend
													</SelectItem>
													<SelectItem value="LinkedIn">
														LinkedIn
													</SelectItem>
													<SelectItem value="Other">
														Other
													</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</FormGroupWrapper>
					{/* ADDED SHORT ANSWER QUESTIONS */}
					<FormGroupWrapper title="Short Answer Questions">
						<div className="grid grid-cols-1 gap-x-2 gap-y-16 pb-10 md:gap-y-26 md:pb-20">
							<FormField
								control={form.control}
								name="questionOne"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex flex-row gap-x-2">
											What does WEHack mean to you?{" "}
											<p className="text-[#F03C2D]">*</p>
										</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Enter answer here"
												className="h-[80%]"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											<span
												className={
													question1.length > 500
														? "text-[#F03C2D]"
														: ""
												}
											>
												{question1.length} / 500
												Characters
											</span>
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="questionTwo"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex flex-row gap-x-2">
											What steps do you take to encourage
											or support inclusive environments
											for underrepresented groups?{" "}
											<p className="text-[#F03C2D]">*</p>
										</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Enter answer here"
												className="h-[80%]"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											<span
												className={
													question2.length > 500
														? "text-[#F03C2D]"
														: ""
												}
											>
												{question2.length} / 500
												Characters
											</span>
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="questionThree"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex flex-row gap-x-2">
											In what ways do you hope to make a
											positive impact through your project
											at WEHack 2025?{" "}
											<p className="text-[#F03C2D]">*</p>
										</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Enter answer here"
												className="h-[80%]"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											<span
												className={
													question3.length > 500
														? "text-[#F03C2D]"
														: ""
												}
											>
												{question3.length} / 500
												Characters
											</span>
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</FormGroupWrapper>
					<FormGroupWrapper title="Day of Event">
						<div className="grid grid-cols-1 gap-x-4 gap-y-2 pb-5 md:grid-cols-2 md:gap-y-0">
							<FormField
								control={form.control}
								name="shirtSize"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex flex-row gap-x-2">
											Shirt Size{" "}
											<p className="text-[#F03C2D]">*</p>
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger className="w-full placeholder:text-muted-foreground">
													<SelectValue placeholder="Shirt Size" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectGroup>
													<SelectItem value="S">
														S
													</SelectItem>
													<SelectItem value="M">
														M
													</SelectItem>
													<SelectItem value="L">
														L
													</SelectItem>
													<SelectItem value="XL">
														XL
													</SelectItem>
													<SelectItem value="2XL">
														2XL
													</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="dietaryRestrictions"
								render={() => (
									<FormItem className="row-span-2">
										<div className="mb-4">
											<FormLabel className="flex flex-row gap-x-2 text-base">
												Dietary Restrictions{" "}
												<p className="text-[#F03C2D]">
													*
												</p>
											</FormLabel>
											<FormDescription>
												Please select which dietary
												restrictions you have so we can
												best accomodate you at the
												event!
											</FormDescription>
										</div>
										{c.registration.dietaryRestrictionOptions.map(
											(item) => (
												<FormField
													key={item}
													control={form.control}
													name="dietaryRestrictions"
													render={({ field }) => {
														return (
															<FormItem
																key={item}
																className="flex flex-row items-start space-x-3 space-y-0"
															>
																<FormControl>
																	<Checkbox
																		checked={field.value?.includes(
																			item,
																		)}
																		onCheckedChange={(
																			checked,
																		) => {
																			return checked
																				? field.onChange(
																						[
																							...field.value,
																							item,
																						],
																					)
																				: field.onChange(
																						field.value?.filter(
																							(
																								value,
																							) =>
																								value !==
																								item,
																						),
																					);
																		}}
																	/>
																</FormControl>
																<FormLabel className="font-normal">
																	{item}
																</FormLabel>
															</FormItem>
														);
													}}
												/>
											),
										)}
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="accommodationNote"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Anything else we can do to better
											accommodate you at our hackathon?
										</FormLabel>
										<FormControl>
											<Textarea
												placeholder="List any accessibility concerns here..."
												className="h-[80%] resize-none"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</FormGroupWrapper>
					<FormGroupWrapper title="Career Info">
						<div className="grid grid-cols-1 gap-x-2 gap-y-2 md:grid-cols-3 md:gap-y-2">
							<FormField
								control={form.control}
								name="github"
								render={({ field }) => (
									<FormItem>
										<FormLabel>GitHub Username</FormLabel>
										<FormControl>
											<Input
												placeholder="Username"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="linkedin"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Linkedin Username</FormLabel>
										<FormControl>
											<Input
												placeholder="Username"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="personalWebsite"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Personal Website</FormLabel>
										<FormControl>
											<Input
												placeholder="https://example.com/"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name="uploadedFile"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="flex flex-row gap-x-2">
										Resume{" "}
										<p className="text-[#F03C2D]">*</p>
									</FormLabel>
									<FormControl>
										<div
											{...getRootProps()}
											className={`border-2${
												resumeFile
													? ""
													: "cursor-pointer"
											} flex min-h-[200px] flex-col items-center justify-center rounded-lg border-dashed border-white`}
										>
											<input
												{...getInputProps()}
												onChange={(e) => {
													console.log(e.target.files?.[0]);
													field.onChange(
														e.target.files?.[0]
														
													);
													setResumeFile(
														e.target.files?.[0] ||
															null,
													);
													console.log("hey")
												}}
											/>
											<p className="p-2 text-center text-xl">
												{resumeFile
													? `${resumeFile.name} (${Math.round(resumeFile.size / 1024)}kb)`
													: isDragActive
														? "Drop your resume here..."
														: "Drag 'n' drop your resume here, or click to select a file"}
											</p>
											{resumeFile ? (
												<Button
													className="mt-4 bg-[#992444] hover:bg-[#F03C2D]"
													onClick={() => {
														field.onChange(null);
														setResumeFile(null);
													}}
												>
													Remove
												</Button>
											) : null}
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</FormGroupWrapper>
					<FormGroupWrapper title="Hacker Profile">
						<div className="grid grid-cols-1 gap-x-2 gap-y-2 md:grid-cols-3 md:gap-y-0">
							<FormField
								control={form.control}
								name="hackerTag"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex flex-row gap-x-2">
											HackerTag{" "}
											<p className="text-[#F03C2D]">*</p>
										</FormLabel>
										<FormControl>
											<div className="flex">
												<div className="flex h-10 w-10 items-center justify-center rounded-l bg-accent text-lg font-light text-primary">
													@
												</div>
												<Input
													className="rounded-l-none"
													placeholder={`${c.hackathonName.toLowerCase()}`}
													{...field}
												/>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="profileDiscordName"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex flex-row">
											Discord Username
										</FormLabel>
										<FormControl>
											<Input
												placeholder={`${c.hackathonName.toLowerCase()} or ${c.hackathonName.toLowerCase()}#1234`}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="pronouns"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex flex-row gap-x-2">
											Pronouns{" "}
											<p className="text-[#F03C2D]">*</p>
										</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="grid grid-cols-1 gap-x-2 gap-y-4 md:grid-cols-2 md:gap-y-0">
							<FormField
								control={form.control}
								name="bio"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex flex-row gap-x-2">
											Bio{" "}
											<p className="text-[#F03C2D]">*</p>
										</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Hello! I'm..."
												className="resize-none"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											<span
												className={
													bioValue.length > 500
														? "text-[#F03C2D]"
														: ""
												}
											>
												{bioValue.length} / 500
												Characters
											</span>
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="skills"
								render={({ field }) => (
									<FormItem className="flex flex-col items-start">
										<FormLabel className="flex flex-row gap-x-2 text-left">
											Skills{" "}
											<p className="text-[#F03C2D]">*</p>
										</FormLabel>
										<FormControl className="min-h-[80px]">
											<TagInput
												inputFieldPostion="top"
												{...field}
												placeholder="Type and then press enter to add a skill..."
												tags={skills}
												className="sm:min-w-[450px]"
												maxLength={50}
												setTags={(newTags) => {
													setSkills(newTags);
													form.setValue(
														"skills",
														newTags as [
															Tag,
															...Tag[],
														],
													);
												}}
											/>
										</FormControl>
										<FormDescription className="!mt-0 tracking-wide text-md">
											<b>Tags can only be less than 50 characters! You can have a max of 10 tags.</b>
											<br></br>
											These skills can be listed on your
											profile and help with the team
											finding process! Enter anything you
											think is relevant, including
											non-technical skills!
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name="profileIsSearchable"
							render={({ field }) => (
								<FormItem className="mx-auto flex max-w-[600px] flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>
											Make my profile searchable by other
											Hackers
										</FormLabel>
										<FormDescription>
											This will allow other Hackers to
											look you up by your name or
											HackerTag. Other Hackers will still
											be able to view your profile and
											invite you to teams if they have
											your link.
										</FormDescription>
									</div>
								</FormItem>
							)}
						/>
					</FormGroupWrapper>
					<Button
						type="submit"
						className="bg-[#D09C51] hover:bg-[#CCBA97]"
					>
						Submit
					</Button>
					{hasErrors && (
						<p className="text-[#F03C2D]">
							Something doesn't look right. Please check your
							inputs.
						</p>
					)}
				</form>
			</Form>
		</div>
	);
}
