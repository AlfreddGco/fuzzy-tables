import "./index.css";
import "./components/Table/specifics.scss";

export {
	CreateForm,
	type CreateFormRef,
	UpdateForm,
	type UpdateFormRef,
} from "./components/Forms";
export { buildTable, useBuildTable } from "./components/Table";
export * from "./lib/schemas/file";
export type { ExtendedField, Field, Fields, StringField } from "./lib/types";
export type { SupportedLocale } from "./stores/locale";
export { setLocale } from "./stores/locale";
