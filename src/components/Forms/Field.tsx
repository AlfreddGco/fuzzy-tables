import React, { useState, useRef, useEffect } from "react";
import _ from "lodash";
import { FieldType } from "../../lib/fields";
import { rainbow } from "../../lib/utils";

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
	type?: FieldType.SingleLine | FieldType.Date | FieldType.Checkbox | FieldType.SingleSelect;
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
			) : type === FieldType.SingleSelect && options ? (
				<CustomSelect
					value={String(value ?? "")}
					options={options}
					onChange={onChange}
					onBlur={onBlur}
					error={shouldShowError}
					name={field as string}
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
						? "Este campo es requerido"
						: error === "Expected number, received nan"
							? "Este campo debe ser un número"
							: error}
				</p>
			)}
		</div>
	);
}

function CustomSelect({
	value,
	options,
	onChange,
	onBlur,
	error,
	name,
}: {
	value: string;
	options: string[];
	onChange: (value: unknown) => void;
	onBlur: () => void;
	error: boolean;
	name: string;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const selectedIndex = options.findIndex(opt => opt === value);
	const selectedColor = selectedIndex >= 0 ? rainbow[selectedIndex % rainbow.length] : null;

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				type="button"
				className={`w-full border rounded-md p-2 text-left flex items-center justify-between ${
					error ? "border-red-500" : "border-gray-300"
				} ${isOpen ? "ring-2 ring-blue-500" : ""}`}
				onClick={() => setIsOpen(!isOpen)}
				onBlur={onBlur}
			>
				<span
					className="flex items-center gap-2"
					style={value && selectedColor ? { color: selectedColor.strong } : {}}
				>
					{value && selectedColor && (
						<span
							className="w-3 h-3 rounded-full"
							style={{ backgroundColor: selectedColor.strong }}
						/>
					)}
					{value || "Select..."}
				</span>
				<svg
					className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{isOpen && (
				<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
					<button
						type="button"
						className="w-full px-3 py-2 text-left hover:bg-gray-100 text-gray-500"
						onClick={() => {
							onChange("");
							setIsOpen(false);
						}}
					>
						Select...
					</button>
					{options.map((option, index) => {
						const colorIndex = index % rainbow.length;
						const color = rainbow[colorIndex];
						const isSelected = option === value;

						return (
							<button
								key={option}
								type="button"
								className={`w-full px-3 py-2 text-left flex items-center gap-2 transition-colors ${
									isSelected ? "" : "hover:opacity-80"
								}`}
								style={{
									backgroundColor: isSelected ? color.strong : color.light,
									color: isSelected ? "white" : color.strong,
								}}
								onClick={() => {
									onChange(option);
									setIsOpen(false);
								}}
							>
								<span
									className="w-3 h-3 rounded-full"
									style={{
										backgroundColor: isSelected ? "white" : color.strong,
									}}
								/>
								{option}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
