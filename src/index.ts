// The table chrome ships as dist/index.css (the package's ./styles.css export)
// for consumers to import, per the README. The library must NOT bundle or
// runtime-inject a compiled Tailwind build: its unlayered preflight and
// utilities override the host app's own (layered) Tailwind — hosts generate
// the utility classes these components use from their own pipeline instead.
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
