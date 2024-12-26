import React, { useEffect } from "react";
import { create, StoreApi, UseBoundStore } from "zustand";
import { ZodArray, ZodBoolean, ZodDate, ZodEnum, ZodObject } from "zod";
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
		type = inferTypeFromValue(value);
	}
	if (type === FieldType.Date) {
		const DATE_CONFIG: Intl.DateTimeFormatOptions = {
			month: "2-digit",
			day: "2-digit",
			year: "numeric",
		};
		return new Date(value).toLocaleDateString("en-US", DATE_CONFIG);
	}
	if (type === FieldType.Undefined) return "-";
	if (type === FieldType.Checkbox) {
		return value ? "✅" : "❌";
	}
	if (type === FieldType.ObjectArray) {
		return JSON.stringify(value);
	}
	if (type === FieldType.SingleSelect) {
		return (
			<span
				className="rounded-md px-2 py-0.5 text-sm"
				style={{
					backgroundColor: rainbow[value.length % rainbow.length].alpha(0.8),
					color: "white",
					fontWeight: "500",
				}}
			>
				{value}
			</span>
		);
	}
	if (type === FieldType.MultipleSelect) {
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
	const stringValue =
		typeof value === "object" ? JSON.stringify(value) : String(value);
	return stringValue.slice(0, 200);
};

interface TableRow {
	_id: string;
	[key: string]: any;
}

interface TableProps {
	data: TableRow[];
}

interface ComposedTableComponent extends React.FC<TableProps> {
	useSelected: (data: TableRow[]) => TableRow[];
	useHandler: (handler: string, listener: (row: TableRow) => void) => void;
	useTableStore: UseBoundStore<StoreApi<TableStore>>;
}

type Fields =
	| string[]
	| {
			header: string;
			field: string;
			render?: (row: TableRow) => React.ReactNode;
	  }[]
	| ZodObject<any, any>[];

type FullDescriptionField = {
	header: string;
	field: string;
	render: (row: TableRow) => React.ReactNode;
};

export const buildTable = (
	fields: Fields,
	handlers: string[] = [],
): ComposedTableComponent => {
	const fieldsArray: FullDescriptionField[] = (function () {
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
			let newSortingFields;

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

	const ComposedTable: ComposedTableComponent = ({ data }) => {
		const {
			rowSelection,
			toggleRowSelection,
			setRowSelection,
			sortingFields,
			toggleSortingField,
			listeners,
		} = useTableStore();
		const isAllSelected = data.every((row) => rowSelection[row._id]);

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
								data.forEach((row) => {
									setRowSelection(row._id, !isAllSelected);
								});
							}}
						>
							<input
								type="checkbox"
								className="pointer"
								checked={isAllSelected}
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
						{handlers.length > 0 && <th></th>}
					</tr>
				</thead>
				<tbody>
					{data.map((row) => (
						<RowErrorBoundary key={row._id}>
							<tr key={row._id} onClick={() => toggleRowSelection(row._id)}>
								<td className="py-3 px-2 text-center">
									<input type="checkbox" checked={rowSelection[row._id]} />
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
		return data.filter((row) => rowSelection[row._id]);
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
