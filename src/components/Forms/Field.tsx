import React from "react";
import _ from "lodash";
import { FieldType } from "../../lib/fields";

export function SidebarField<T>({
	field,
	header,
	value,
	onChange,
	onBlur,
	error,
	type = FieldType.SingleLine,
	options,
}: {
	field: keyof T;
	header: string;
	value: unknown;
	onChange: (value: unknown) => void;
	onBlur: () => void;
	error?: string | null;
	type?: FieldType;
	options?: string[];
}) {
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
			{type === FieldType.Date ? (
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
			) : type === FieldType.Checkbox ? (
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
			) : type === FieldType.SingleSelect ? (
				<select
					name={field as string}
					className={`border border-gray-300 rounded-md p-2 ${
						shouldShowError ? "border-blue-500" : ""
					}`}
					value={String(value ?? "")}
					onChange={(e) => onChange(e.target.value)}
					onBlur={onBlur}
				>
					{options?.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
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
						? "Este campo es requerido"
						: error === "Expected number, received nan"
							? "Este campo debe ser un número"
							: error}
				</p>
			)}
		</div>
	);
}
