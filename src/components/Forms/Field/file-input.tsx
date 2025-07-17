import React, { useRef } from "react";
import { fileSchema } from "src/lib/schemas/file";
import type { z } from "zod";
import type { SupportedLocale } from "../../../stores/locale";
import { LOCALES, useChosenLocale } from "../../../stores/locale";
import { FileItem } from "./file-item";

const DEFAULT_MESSAGES = {
	[LOCALES.en as SupportedLocale]: {
		choose_file: "Choose file",
		no_file_chosen: "No file chosen",
		file_uploaded: "File uploaded",
	} as const,
	[LOCALES.es as SupportedLocale]: {
		choose_file: "Elegir archivo",
		no_file_chosen: "Ningún archivo elegido",
		file_uploaded: "Archivo subido",
	} as const,
} as const;

interface FileInputProps {
	name: string;
	value: unknown;
	onChange: (value: unknown) => void;
	onBlur: () => void;
	error: boolean;
	multiple?: boolean;
}

export function FileInput({
	name,
	value,
	onChange,
	onBlur,
	error,
	multiple = false,
}: FileInputProps) {
	const locale = useChosenLocale();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;
		// Single file
		onChange(files[0]);
	};

	const hasFile =
		value instanceof File ||
		(typeof value === "object" && value !== null && "key" in value);

	return (
		<div className="flex flex-col gap-2">
			<input
				ref={fileInputRef}
				type="file"
				name={name}
				className="hidden"
				onChange={handleFileChange}
				onBlur={onBlur}
				multiple={multiple}
			/>
			{hasFile ? (
				<FileItem
					file={value as z.infer<ReturnType<typeof fileSchema>>}
					onRemove={() => onChange(undefined)}
				/>
			) : (
				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						className={`flex-1 border border-gray-300 rounded-md p-2 text-left hover:bg-gray-50 transition-colors ${
							error ? "border-red-500" : ""
						}`}
					>
						<span className="flex items-center justify-between">
							<span className={value ? "text-gray-900" : "text-gray-500"}>
								{DEFAULT_MESSAGES[locale].no_file_chosen}
							</span>
							<span className="text-sm text-gray-500">
								{DEFAULT_MESSAGES[locale].choose_file}
							</span>
						</span>
					</button>
				</div>
			)}
		</div>
	);
}
