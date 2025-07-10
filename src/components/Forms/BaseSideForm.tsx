import React from "react";
import { GenericRecord, zodFromFields } from "../../lib/types";
import { categorizeNestedField, getEnumOptions } from "../../lib/fields";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import _ from "lodash";
import { z } from "zod";
import { SidebarField } from "./Field";

export type SideFormRef<T> = {
	open: () => void;
	setField: <K extends keyof T>(field: K, value: T[K]) => void;
};

export type SideFormProps<T> = {
	/** Array of field definitions with their validation schemas */
	fields: {
		/** Field name/path that matches the form data structure */
		field: string;
		/** Display label for the field */
		header: string;
		/** Zod schema for field validation */
		z: z.ZodType;
	}[];
	/** Title displayed at the top of the side form */
	title: string;
	/** Text displayed on the submit button */
	submitText: string;
	/** Description text shown below the title */
	description: string;
	/** Handler called when form is submitted with valid data */
	onSubmit: (formData: T) => Promise<void>;
	/** Optional custom error message formatter */
	getErrorMessage?: (error: Error) => string;
};

export const SideForm = forwardRef(
	<T extends GenericRecord>(
		{
			fields,
			title,
			submitText,
			description,
			onSubmit,
			getErrorMessage,
		}: SideFormProps<T>,
		ref: React.ForwardedRef<SideFormRef<T>>,
	) => {
		const zSchema = zodFromFields(fields);
		const [isOpen, setIsOpen] = useState(false);
		const [formData, setFormData] = useState<T>({} as T);
		const [globalError, setGlobalError] = useState<string | null>(null);
		const [validationErrors, setValidationErrors] = useState<
			Record<keyof T, string | null>
		>({} as Record<keyof T, string | null>);
		const [submitting, setSubmitting] = useState(false);

		const validateField = (field: string, value: unknown) => {
			const fieldSchema = zSchema.shape[field];
			try {
				fieldSchema.parse(value);
				setValidationErrors((prev) => ({ ...prev, [field]: null }));
				return true;
			} catch (err) {
				if (err instanceof z.ZodError) {
					setValidationErrors((prev) => ({
						...prev,
						[field]: err.errors[0].message,
					}));
				}
				return false;
			}
		};

		const handleFieldChange = (field: string, value: unknown) => {
			setFormData((prev) => {
				const newFormData = { ...prev };
				_.set(newFormData, field, value);
				return newFormData;
			});
		};

		const handleFieldBlur = (field: string) => {
			const fieldSchema = zSchema.shape[field];
			const valueToValidate = formData[field];

			// Only try to parse numbers on blur
			if (
				fieldSchema instanceof z.ZodNumber &&
				typeof valueToValidate === "string"
			) {
				if (valueToValidate === "") {
					setFormData((prev) => ({ ...prev, [field]: undefined }) as T);
				} else {
					const parsed = Number(valueToValidate);
					if (!Number.isNaN(parsed)) {
						setFormData((prev) => ({ ...prev, [field]: parsed }) as T);
					}
				}
			}

			validateField(field, valueToValidate);
		};

		const handleSubmit = async () => {
			const result = zSchema.safeParse(formData);
			if (!result.success) {
				const newErrors: Record<keyof T, string | null> = {} as Record<
					keyof T,
					string | null
				>;
				for (const err of result.error.errors) {
					const field = err.path[0] as keyof T;
					newErrors[field] = err.message;
				}
				setValidationErrors(newErrors);
				return;
			}

			setSubmitting(true);

			try {
				await onSubmit(formData);
				setIsOpen(false);
				setFormData({} as T);
			} catch (error) {
				setGlobalError(
					getErrorMessage?.(error as Error) ??
						"Ocurrió un error, intenta de nuevo.",
				);
			} finally {
				setSubmitting(false);
			}
		};

		useEffect(() => {
			document.body.style.overflow = isOpen ? "hidden" : "unset";
			return () => {
				document.body.style.overflow = "unset";
			};
		}, [isOpen]);

		useImperativeHandle(ref, () => ({
			open: () => {
				setIsOpen(true);
				setGlobalError(null);
				setValidationErrors({} as Record<keyof T, string | null>);
			},
			setField: <K extends keyof T>(field: K, value: T[K]) => {
				handleFieldChange(field as string, value);
			},
		}));

		return (
			<>
				<div
					className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out ${isOpen ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
					onClick={() => setIsOpen(false)}
					onKeyDown={() => setIsOpen(false)}
					role="button"
					tabIndex={0}
					style={{ zIndex: 40 }}
				/>
				<div
					className={`fixed right-0 top-0 h-full w-1/4 bg-white shadow-lg transform transition-all duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
					style={{ zIndex: 50 }}
				>
					<div className="p-6 border-b">
						<div className="flex justify-between items-center">
							<div>
								<h2 className="text-xl mb-0 font-semibold">{title}</h2>
								<h3 className="text-sm text-gray-500">{description}</h3>
							</div>
							<button
								type="button"
								onClick={() => setIsOpen(false)}
								className="p-2 hover:bg-gray-100 rounded-full"
							>
								<svg
									className="w-6 h-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
					</div>

					<div
						className="p-6 overflow-y-auto"
						style={{ height: "calc(100% - 88px)" }}
					>
						<div className="space-y-4">
							{fields.map((field) => (
								<SidebarField<T>
									key={field.field as string}
									field={field.field as string}
									header={field.header}
									value={_.get(formData, field.field as string) ?? ""}
									onChange={(value) =>
										handleFieldChange(field.field as string, value)
									}
									onBlur={() => handleFieldBlur(field.field as string)}
									error={validationErrors[field.field as keyof T]}
									type={categorizeNestedField(field.field as string, zSchema)}
									options={getEnumOptions(field.field as string, zSchema) || undefined}
								/>
							))}
						</div>
						<div className="py-6">
							{globalError && (
								<p className="text-red-500 mb-2">{globalError}</p>
							)}
							<button
								type="button"
								className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
								onClick={handleSubmit}
								disabled={submitting}
							>
								{submitting ? "..." : submitText}
							</button>
						</div>
					</div>
				</div>
			</>
		);
	},
) as <T extends GenericRecord>(
	props: SideFormProps<T> & { ref: React.ForwardedRef<SideFormRef<T>> },
) => JSX.Element;
