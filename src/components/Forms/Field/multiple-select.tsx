import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { rainbow } from "../../../lib/utils";

interface MultipleSelectProps {
	name: string;
	value: string[];
	options: string[];
	onChange: (value: string[]) => void;
	onBlur: () => void;
	error?: boolean;
}

export function MultipleSelect({
	value = [],
	options,
	onChange,
	onBlur,
	error = false,
}: MultipleSelectProps) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	// Handle clicks outside to close dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleToggleOption = (option: string) => {
		const newValue = _.xor(value, [option]);
		onChange(newValue);
	};

	const getOptionColor = (option: string) => {
		const index = options.indexOf(option);
		return rainbow[index % rainbow.length];
	};

	return (
		<div ref={containerRef} className="relative">
			<div
				className={`border rounded-md p-2 cursor-pointer bg-white ${
					error ? "border-red-500" : "border-gray-300"
				} ${isOpen ? "ring-2 ring-blue-500" : ""}`}
				onClick={() => setIsOpen(!isOpen)}
				onBlur={onBlur}
				tabIndex={0}
				role="button"
				aria-haspopup="listbox"
				aria-expanded={isOpen}
			>
				<div className="flex flex-wrap gap-1">
					{value.length > 0 ? (
						value.map((val) => {
							const color = getOptionColor(val);
							return (
								<span
									key={val}
									className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
									style={{
										backgroundColor: color.light,
										color: color.strong,
									}}
								>
									{val}
								</span>
							);
						})
					) : (
						<span className="text-gray-400">Select options...</span>
					)}
				</div>
			</div>

			{isOpen && (
				<div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
					<ul
						className="max-h-60 overflow-y-auto py-1"
						role="listbox"
						aria-multiselectable="true"
					>
						{options.map((option) => {
							const isSelected = value.includes(option);
							const color = getOptionColor(option);

							return (
								<li
									key={option}
									className={`cursor-pointer px-3 py-2 hover:bg-gray-50 flex items-center justify-between`}
									onClick={() => handleToggleOption(option)}
									role="option"
									aria-selected={isSelected}
								>
									<span className="flex items-center">
										<input
											type="checkbox"
											checked={isSelected}
											onChange={() => {}}
											className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
											style={{
												accentColor: color.strong,
											}}
										/>
										<span>{option}</span>
									</span>
									{isSelected && (
										<span
											className="ml-2 inline-block w-3 h-3 rounded-full"
											style={{
												backgroundColor: color.strong,
											}}
										/>
									)}
								</li>
							);
						})}
					</ul>
				</div>
			)}
		</div>
	);
}
