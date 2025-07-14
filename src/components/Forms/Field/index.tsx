import React from "react";
import _ from "lodash";
import { FIELD_TYPES } from "../../../lib/fields";
import { LOCALES, useChosenLocale } from "../../../stores/locale";
import type { SupportedLocale } from "../../../stores/locale";
import { CustomSelect } from "./custom-select";
import { FileInput } from "./file-input";
import { MultipleSelect } from "./multiple-select";

const DEFAULT_MESSAGES = {
  [LOCALES.en as SupportedLocale]: {
    required: 'This field is required',
    requires_number: 'This field must be a number',
  } as const,
  [LOCALES.es as SupportedLocale]: {
    required: 'Este campo es requerido',
    requires_number: 'Este campo debe ser un número',
  } as const,
} as const;

export function SidebarField<T>({
	field,
	header,
	value,
	onChange,
	onBlur,
	error,
	type = FIELD_TYPES.SingleLine,
	options,
}: {
	field: keyof T;
	header: string;
	value: unknown;
	onChange: (value: unknown) => void;
	onBlur: () => void;
	error?: string | null;
	type?: typeof FIELD_TYPES["SingleLine" | "Date" | "Checkbox" | "SingleSelect" | "File" | "MultipleSelect"];
	options?: string[];
}) {
  const locale = useChosenLocale()
  const shouldShowError = error != null && error !== "";

	const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const [year, month, day] = e.target.value.split("-").map(Number);
		const date = new Date(year, month - 1, day);
		onChange(date);
	};

	const formatDateValue = (date: Date) => {
		if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";

		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange(e.target.value);
	};

	return (
		<div className="flex flex-col gap-2">
			<p className="text-md font-medium">{header}</p>
			{type === FIELD_TYPES.Date ? (
				<input
					type="date"
					name={field as string}
					className={`border border-gray-300 rounded-md p-2 ${
						shouldShowError ? "border-red-500" : ""
					}`}
					value={value instanceof Date ? formatDateValue(value) : ""}
					onChange={handleDateChange}
					onBlur={onBlur}
				/>
			) : type === FIELD_TYPES.Checkbox ? (
				<input
					type="checkbox"
					name={field as string}
					checked={value as boolean}
					className={`border border-gray-300 rounded-md p-2 mr-auto ${
						shouldShowError ? "border-red-500" : ""
					}`}
					onChange={(e) => onChange(e.target.checked)}
					onBlur={onBlur}
				/>
			) : type === FIELD_TYPES.SingleSelect && options ? (
				<CustomSelect
					value={String(value ?? "")}
					options={options}
					onChange={onChange}
					onBlur={onBlur}
					error={shouldShowError}
					name={field as string}
				/>
			) : type === FIELD_TYPES.File ? (
				<FileInput
					name={field as string}
					value={value}
					onChange={onChange}
					onBlur={onBlur}
					error={shouldShowError}
				/>
			) : type === FIELD_TYPES.MultipleSelect && options ? (
				<MultipleSelect
					name={field as string}
					value={value as string[] || []}
					options={options}
					onChange={onChange}
					onBlur={onBlur}
					error={shouldShowError}
				/>
			) : (
				<input
					type="text"
					name={field as string}
					className={`border border-gray-300 rounded-md p-2 ${
						shouldShowError ? "border-red-500" : ""
					}`}
					value={String(value ?? "")}
					onChange={handleTextChange}
					onBlur={onBlur}
				/>
			)}
			{shouldShowError && (
				<p className="text-red-500 text-sm">
					{error === "Required"
						? DEFAULT_MESSAGES[locale].required
						: error === "Expected number, received nan"
							? DEFAULT_MESSAGES[locale].requires_number
							: (error === "Invalid input" && type === "File" && !value)
						  	? DEFAULT_MESSAGES[locale].required : error
					}
				</p>
			)}
		</div>
	);
}
