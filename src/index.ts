import "./index.css";
import "./components/Table/specifics.scss";
export { buildTable } from "./components/Table";
export type { Field, Fields } from "./components/Table";
export {
	CreateForm,
	UpdateForm,
	type CreateFormRef,
	type UpdateFormRef,
} from "./components/Forms";
export { setLocale } from "./stores/locale";
export type { SupportedLocale } from "./stores/locale";
export * from "./lib/schemas/file";
