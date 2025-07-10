import React, { useState, useRef, useEffect } from "react";
import _ from "lodash";
import { rainbow } from "../../../lib/utils";

export function CustomSelect({
	value,
	options,
	onChange,
	onBlur,
	error,
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
