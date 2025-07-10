import React from "react";
import { GenericRecord } from "../../lib/types";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import _ from "lodash";
import { SideForm, SideFormProps, SideFormRef } from "./BaseSideForm";
import { LOCALES, SupportedLocale, useChosenLocale } from "../../stores/locale";

export type CreateFormRef = { open: () => void };

const DEFAULT_MESSAGES = {
  [LOCALES.en]: {
    add: 'Add',
    save: 'Save',
  },
  [LOCALES.es]: {
    add: 'Agregar',
    save: 'Guardar',
  }
} as { [key in SupportedLocale]: { [key: string]: string } };

type CreateFormProps<T> = {
	fields: SideFormProps<T>["fields"];
	getErrorMessage?: SideFormProps<T>["getErrorMessage"];
	onSubmit: (formData: T) => Promise<void>;
	title: string;
	description: string;
};

export const CreateForm = forwardRef(
	<T extends GenericRecord>(
		{
			fields,
			onSubmit,
			title,
			description,
			getErrorMessage,
		}: CreateFormProps<T>,
		ref: React.ForwardedRef<CreateFormRef>,
	) => {
    const locale = useChosenLocale();
  	const sidebarRef = useRef<SideFormRef<T>>(null);

		useImperativeHandle(ref, () => ({
			open: () => sidebarRef.current?.open(),
		}));

		return (
			<SideForm<T>
				fields={fields}
				ref={sidebarRef}
				title={title}
				description={description}
				onSubmit={onSubmit}
				submitText={DEFAULT_MESSAGES[locale].add}
				getErrorMessage={getErrorMessage}
			/>
		);
	},
) as <T extends GenericRecord>(
	props: CreateFormProps<T> & {
		ref?: React.ForwardedRef<CreateFormRef>;
	},
) => JSX.Element;

export type UpdateFormRef<T> = {
	openEditModal: (editRecord: T & { id: string }) => void;
};

type UpdateFormProps<T> = {
	fields: SideFormProps<T>["fields"];
	getErrorMessage?: SideFormProps<T>["getErrorMessage"];
	onSubmit: (id: string, formData: T) => Promise<void>;
	title: string;
	description: string;
};

export const UpdateForm = forwardRef(
	<T extends GenericRecord>(
		{
			fields,
			onSubmit,
			title,
			description,
			getErrorMessage,
		}: UpdateFormProps<T>,
		ref: React.ForwardedRef<UpdateFormRef<T>>,
	) => {
    const locale = useChosenLocale();
		const sidebarRef = useRef<SideFormRef<T>>(null);
		const [editRecord, setEditRecord] = useState<(T & { id: string }) | null>(
			null,
		);

		const handleSubmit = async (formData: T) => {
			if (!editRecord) {
				throw new Error("No edit record provided");
			}
			await onSubmit(editRecord.id, formData);
		};

		useImperativeHandle(ref, () => ({
			openEditModal: (editRecord: T & { id: string }) => {
				setEditRecord(editRecord);
				sidebarRef.current?.open?.();
				for (const [key, value] of Object.entries(editRecord)) {
					if (key !== "id") {
						sidebarRef.current?.setField(
							key as keyof T,
							value as T[keyof T],
						);
					}
				}
			},
		}));

		return (
			<SideForm<T>
				fields={fields}
				ref={sidebarRef}
				title={title}
				description={description}
				onSubmit={handleSubmit}
				submitText={DEFAULT_MESSAGES[locale].save}
				getErrorMessage={getErrorMessage}
			/>
		);
	},
) as <T extends GenericRecord>(
	props: UpdateFormProps<T> & {
		ref?: React.ForwardedRef<UpdateFormRef<T>>;
	},
) => JSX.Element;
