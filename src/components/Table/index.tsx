import React, { useEffect } from "react";
import { create, StoreApi, UseBoundStore } from "zustand";
import { ZodArray, ZodBoolean, ZodDate, ZodEnum, ZodObject } from "zod";
import { z } from "zod";
import _ from "lodash";

import {
	StyledTable,
	TableHeader,
	TableHandler,
	RowErrorBoundary,
} from "./specifics";
import { FieldType, inferTypeFromValue } from "../../fields";
import { headerNameFromField, rainbow } from "../../utils";

type SortingField = {
	field: string;
	direction: "asc" | "desc";
};

type TableStore = {
	rowSelection: Record<string, boolean>;
	toggleRowSelection: (rowId: string) => void;
	setRowSelection: (rowId: string, value: boolean) => void;
	sortingFields: SortingField[];
	toggleSortingField: (field: string) => void;
	listeners: Record<string, ((row: any) => void) | undefined>;
	addListener: (handler: string, callback: (row: any) => void) => void;
	removeListener: (handler: string) => void;
};

const renderField = (
	row: TableRow,
	field: string,
	type?: string,
): React.ReactNode => {
	const value = _.get(row, field);
	if (!type) {
		const inferredType = inferTypeFromValue(value);
		switch (inferredType) {
			case FieldType.Date: {
				const DATE_CONFIG: Intl.DateTimeFormatOptions = {
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
				};
				return new Date(value).toLocaleDateString("es-MX", DATE_CONFIG);
			}
			case FieldType.Undefined:
			case FieldType.Null:
				return "-";
			case FieldType.Checkbox:
				return value ? "✅" : "❌";
			case FieldType.ObjectArray:
				return JSON.stringify(value);
			case FieldType.SingleSelect:
				return (
					<span
						className="rounded-md px-2 py-0.5 text-sm"
						style={{
							backgroundColor:
								rainbow[value.length % rainbow.length].alpha(0.8),
							color: "white",
							fontWeight: "500",
						}}
					>
						{value}
					</span>
				);
			case FieldType.MultipleSelect: {
				const chips = value as string[];
				return chips.map((chip, idx) => (
					<span
						key={chip}
						className="rounded-md px-2 py-0.5 text-sm"
						style={{
							marginLeft: idx > 0 ? "0.25em" : 0,
							backgroundColor: rainbow[chip.length % rainbow.length].alpha(0.8),
							color: "white",
							fontWeight: "500",
						}}
					>
						{chip}
					</span>
				));
			}
			case FieldType.SingleLine: {
				const stringValue =
					typeof value === "object" ? JSON.stringify(value) : String(value);
				return stringValue.slice(0, 200);
			}
			default: {
				const _exhaustiveCheck: never = inferredType;
				throw new Error(`Unhandled field type: ${_exhaustiveCheck}`);
			}
		}
	} else {
		const stringValue =
			typeof value === "object" ? JSON.stringify(value) : String(value);
		return stringValue.slice(0, 200);
	}
};

interface TableRow {
	id: string;
	// biome-ignore lint/suspicious/noExplicitAny: Literally any
	[key: string]: any;
}

interface TableProps {
	data: TableRow[];
	onRowClick?: (row: TableRow) => void;
}

interface ComposedTableComponent extends React.FC<TableProps> {
	useSelected: (data: TableRow[]) => TableRow[];
	useHandler: (handler: string, listener: (row: TableRow) => void) => void;
	useTableStore: UseBoundStore<StoreApi<TableStore>>;
}

export type Field =
	| string
	| {
			header: string;
			field: string;
			z?: z.ZodType;
			render?: (row: TableRow) => React.ReactNode;
	  };

export type Fields = Field[] | ZodObject<any, any>;

type FullDescriptionField = {
	header: string;
	field: string;
	render: (row: TableRow) => React.ReactNode;
};

export const buildTable = (
	fields: Fields,
	handlers: string[] = [],
): ComposedTableComponent => {
	const fieldsArray: FullDescriptionField[] = (() => {
		if (fields instanceof ZodObject) {
			const object = fields;
			return Object.entries(object.shape).map(([key, field]) => {
				let type = FieldType.SingleLine;
				if (field instanceof ZodEnum) {
					type = FieldType.SingleSelect;
				} else if (field instanceof ZodArray) {
					type = FieldType.MultipleSelect;
				} else if (field instanceof ZodDate) {
					type = FieldType.Date;
				} else if (field instanceof ZodBoolean) {
					type = FieldType.Checkbox;
				} else if (field instanceof ZodObject) {
					type = FieldType.ObjectArray;
				}
				return {
					header: headerNameFromField(key),
					field: key,
					render: (row: TableRow) => renderField(row, key, type),
				};
			});
		}
		// Array of strings
		if (
			Array.isArray(fields) &&
			fields.every((field) => typeof field === "string")
		) {
			return fields.map((field) => ({
				header: headerNameFromField(field),
				field,
				render: (row: TableRow) => renderField(row, field),
			}));
		} else if (
			Array.isArray(fields) &&
			fields.every(
				(field) =>
					typeof field === "object" && "header" in field && "field" in field,
			)
		) {
			// Array of {header,field,render}
			return fields.map((field) => ({
				...field,
				render:
					field.render || ((row: TableRow) => renderField(row, field.field)),
			}));
		}
		throw new Error("Invalid fields type");
	})();

	const useTableStore = create<TableStore>((set, get) => ({
		rowSelection: {},
		toggleRowSelection: (rowId) => {
			const rowSelection = get().rowSelection;
			set({
				rowSelection: {
					...rowSelection,
					[rowId]: !rowSelection[rowId],
				},
			});
		},
		setRowSelection: (rowId, value) => {
			set({ rowSelection: { ...get().rowSelection, [rowId]: value } });
		},
		sortingFields: [],
		toggleSortingField: (field) => {
			const { sortingFields } = get();
			const existingSortingField = sortingFields.find((f) => f.field === field);
			let newSortingFields: SortingField[] = [];

			if (!existingSortingField) {
				newSortingFields = [...sortingFields, { field, direction: "desc" }];
			} else if (existingSortingField.direction === "desc") {
				newSortingFields = sortingFields.map((f) =>
					f.field === field ? { ...f, direction: "asc" } : f,
				);
			} else {
				newSortingFields = sortingFields.filter((f) => f.field !== field);
			}

			set({ sortingFields: newSortingFields as SortingField[] });
		},
		listeners: {},
		addListener: (handler, callback) => {
			set({
				listeners: {
					...get().listeners,
					[handler]: callback,
				},
			});
		},
		removeListener: (handler) => {
			set({
				listeners: {
					...get().listeners,
					[handler]: undefined,
				},
			});
		},
	}));

	const ComposedTable: ComposedTableComponent = ({ data, onRowClick }) => {
		const {
			rowSelection,
			toggleRowSelection,
			setRowSelection,
			sortingFields,
			toggleSortingField,
			listeners,
		} = useTableStore();
		const isAllSelected = data.every((row) => rowSelection[row.id]);

		const onHandlerClick = (handler: string, row: TableRow) => {
			const listener = listeners[handler];
			if (listener) {
				listener(row);
			} else {
				console.warn(
					`Handler ${handler} was clicked but no listener was found`,
				);
			}
		};

		return (
			<StyledTable className="w-full overflow-auto relative">
				<thead>
					<tr>
						<th
							className="p-2 pointer"
							onClick={() => {
								for (const row of data) {
									setRowSelection(row.id, !isAllSelected);
								}
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									for (const row of data) {
										setRowSelection(row.id, !isAllSelected);
									}
								}
							}}
						>
							<input
								type="checkbox"
								className="pointer"
								checked={isAllSelected || false}
								onChange={() => {
									for (const row of data) {
										setRowSelection(row.id, !isAllSelected);
									}
								}}
							/>
						</th>
						{fieldsArray.map(({ header, field }) => (
							<TableHeader
								key={field}
								headerName={header}
								field={field}
								sortingFields={sortingFields}
								toggleSortingField={toggleSortingField}
							/>
						))}
						{handlers.length > 0 && <th />}
					</tr>
				</thead>
				<tbody>
					{data.map((row) => (
						<RowErrorBoundary key={row.id}>
							<tr
								key={row.id}
								onClick={(e) => {
									// If not clicking the checkbox
									const clickingCheckbox = e.target instanceof HTMLInputElement;
									if (!clickingCheckbox) {
										if (onRowClick) {
											onRowClick(row);
										} else {
											toggleRowSelection(row.id);
										}
									}
								}}
								onKeyDown={(e) => {
									if (e.key === "Space") {
										toggleRowSelection(row.id);
									}
									if (e.key === "Enter" && onRowClick) {
										onRowClick(row);
									}
								}}
							>
								<td className="py-3 px-2 text-center">
									<input
										type="checkbox"
										checked={rowSelection[row.id] || false}
										onChange={() => toggleRowSelection(row.id)}
									/>
								</td>
								{fieldsArray.map(({ field, render }) => (
									<td
										key={field}
										className="py-3 px-2"
										data-type={inferTypeFromValue(row[field])}
									>
										{render(row)}
									</td>
								))}
								{handlers.length > 0 && (
									<td>
										<TableHandler
											handlers={handlers}
											onHandlerClick={(handler) => onHandlerClick(handler, row)}
										/>
									</td>
								)}
							</tr>
						</RowErrorBoundary>
					))}
				</tbody>
			</StyledTable>
		);
	};

	ComposedTable.useSelected = (data) => {
		const { rowSelection } = useTableStore();
		return data.filter((row) => rowSelection[row.id]);
	};

	ComposedTable.useHandler = (handler, listener) => {
		const { addListener, removeListener } = useTableStore();
		useEffect(() => {
			addListener(handler, listener);
			return () => {
				removeListener(handler);
			};
		}, [handler, listener]);
	};

	ComposedTable.useTableStore = useTableStore;

	return ComposedTable;
};
