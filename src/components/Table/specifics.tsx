import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { headerNameFromField } from "../../utils";

import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "./dropdown-menu";

import {
	ArrowUpIcon,
	ArrowDownIcon,
	DotsHorizontalIcon,
} from "@radix-ui/react-icons";

interface SortingField {
	field: string;
	direction: "asc" | "desc";
}

interface TableHeaderProps {
	field: string;
	sortingFields: SortingField[];
	toggleSortingField: (field: string) => void;
	headerName?: string;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
	headerName,
	field,
	sortingFields,
	toggleSortingField,
}) => {
	const sortingField = sortingFields.find((f) => f.field === field);
	return (
		<th
			key={field}
			className="p-2 text-left text-[rgba(0,0,0,0.5)]"
			onClick={() => toggleSortingField(field)}
			onKeyDown={(e) => {
				if (e.key === "Enter") {
					toggleSortingField(field);
				}
			}}
		>
			<div className="flex items-center justify-between gap-1">
				<span>{headerName || headerNameFromField(field)}</span>
				{sortingField &&
					(sortingField.direction === "asc" ? (
						<ArrowUpIcon />
					) : (
						<ArrowDownIcon />
					))}
			</div>
		</th>
	);
};

interface RowErrorBoundaryProps {
	children: React.ReactNode;
}

export const RowErrorBoundary: React.FC<RowErrorBoundaryProps> = ({
	children,
}) => {
	return <ErrorBoundary fallback={<div>Error</div>}>{children}</ErrorBoundary>;
};

import styles from "./specifics.module.scss";
export const StyledTable = ({
	className = "",
	...props
}: React.HTMLAttributes<HTMLTableElement>) => (
	<table {...props} className={`${styles.table} ${className}`} />
);

interface TableHandlerProps {
	handlers: string[];
	onHandlerClick: (handler: string) => void;
}

export const TableHandler: React.FC<TableHandlerProps> = ({
	handlers,
	onHandlerClick,
}) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild className="w-full h-full">
				<button
					onClick={(e: React.MouseEvent) => e.stopPropagation()}
					className="p-1 hover:bg-gray-100 bg-white"
					type="button"
				>
					<DotsHorizontalIcon />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				{handlers.map((handler) => (
					<DropdownMenuItem
						key={handler}
						onClick={(e: React.MouseEvent) => {
							e.stopPropagation();
							onHandlerClick(handler);
						}}
					>
						{handler}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
