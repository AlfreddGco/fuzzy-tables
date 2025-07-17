import React, { useRef } from "react";
import { fileSchema } from "src/lib/schemas/file";
import type { z } from "zod";
import type { SupportedLocale } from "../../../stores/locale";
import { LOCALES, useChosenLocale } from "../../../stores/locale";
import { FileItem } from "./file-item";

const DEFAULT_MESSAGES = {
	[LOCALES.en as SupportedLocale]: {
		add_files: "Add files",
		no_files_chosen: "No files chosen",
		files_uploaded: "files uploaded",
	} as const,
	[LOCALES.es as SupportedLocale]: {
		add_files: "Agregar archivos",
		no_files_chosen: "Ningún archivo elegido",
		files_uploaded: "archivos subidos",
	} as const,
} as const;

interface MultipleFilesInputProps {
	name: string;
	value: unknown;
	onChange: (value: unknown) => void;
	onBlur: () => void;
	error: boolean;
}

type FileType = z.infer<ReturnType<typeof fileSchema>>;

export function MultipleFilesInput({
	name,
	value,
	onChange,
	onBlur,
	error,
}: MultipleFilesInputProps) {
	const locale = useChosenLocale();
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Ensure value is always an array
	const files = Array.isArray(value) ? value : [];

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = e.target.files;
		if (!selectedFiles || selectedFiles.length === 0) return;

		// Convert FileList to array and append to existing files
		const newFiles = Array.from(selectedFiles);
		const updatedFiles = [...files, ...newFiles];
		onChange(updatedFiles);

		// Reset the input value to allow selecting the same file again
		e.target.value = "";
	};

	const handleRemoveFile = (index: number) => {
		const updatedFiles = files.filter((_, i) => i !== index);
		onChange(updatedFiles.length > 0 ? updatedFiles : []);
	};

	const hasFiles = files.length > 0;

	return (
		<div className="flex flex-col gap-2">
			<input
				ref={fileInputRef}
				type="file"
				name={name}
				className="hidden"
				onChange={handleFileChange}
				onBlur={onBlur}
				multiple
			/>
			
			{hasFiles && (
				<div className="flex flex-wrap gap-2">
					{files.map((file, index) => (
						<FileItem
							key={
								file instanceof File
									? `${file.name}-${file.size}-${index}`
									: file?.key || index
							}
							file={file as FileType}
							onRemove={() => handleRemoveFile(index)}
						/>
					))}
				</div>
			)}

			<button
				type="button"
				onClick={() => fileInputRef.current?.click()}
				className={`border border-gray-300 rounded-md p-2 text-left hover:bg-gray-50 transition-colors ${
					error ? "border-red-500" : ""
				}`}
			>
				<span className="flex items-center justify-between">
					<span className={hasFiles ? "text-gray-900" : "text-gray-500"}>
						{hasFiles
							? `${files.length} ${DEFAULT_MESSAGES[locale].files_uploaded}`
							: DEFAULT_MESSAGES[locale].no_files_chosen}
					</span>
					<span className="text-sm text-gray-500">
						{DEFAULT_MESSAGES[locale].add_files}
					</span>
				</span>
			</button>
		</div>
	);
}