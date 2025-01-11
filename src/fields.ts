export enum FieldType {
	SingleLine = "string",
	Date = "date",
	Checkbox = "boolean",
	MultipleSelect = "string[]",
	SingleSelect = "single-select",
	ObjectArray = "object[]",
	Undefined = "undefined",
	Null = "null",
}

export const inferTypeFromValue = (value: any): FieldType => {
	const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
	if (value instanceof Date) return FieldType.Date;
	if (typeof value === "string" && dateRegex.test(value)) {
		return FieldType.Date;
	}
	if (value === undefined) return FieldType.Undefined;
	if (value === null) return FieldType.Null;
	if (value === "true" || value === true) return FieldType.Checkbox;
	if (value === "false" || value === false) return FieldType.Checkbox;
	if (
		Array.isArray(value) &&
		value.length > 0 &&
		value.some((v) => typeof v === "object" && v !== null)
	) {
		return FieldType.ObjectArray;
	}
	if (Array.isArray(value)) {
		return FieldType.MultipleSelect;
	}
	return FieldType.SingleLine;
};
