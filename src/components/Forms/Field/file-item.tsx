import { FileIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { fileSchema } from "src/lib/schemas/file";
import type { z } from "zod";

export function FileItem({
	file,
	onRemove,
}: {
	file: z.infer<ReturnType<typeof fileSchema>>;
	onRemove: () => void;
}) {
	const [isImage, setIsImage] = useState(false);
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [fileName, setFileName] = useState<string>("");

	// Check if file extension indicates an image
	const isImageFile = (filename: string) => {
		const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
		const extension = filename.split(".").pop()?.toLowerCase();
		return extension ? imageExtensions.includes(extension) : false;
	};

	// Check if URL is base64 data
	const isBase64DataUrl = (url: string): boolean => {
		return url.startsWith("data:");
	};

	// Check if base64 data URL is an image
	const isBase64Image = (url: string): boolean => {
		return url.startsWith("data:image/");
	};

	// Extract filename from URL or key
	const getFileNameFromUrl = (url: string): string => {
		// Handle base64 data URLs
		if (isBase64DataUrl(url)) {
			const mimeMatch = url.match(/data:([^;]+)/);
			if (mimeMatch) {
				const mime = mimeMatch[1];
				// Try to create a meaningful filename based on mime type
				const extension = mime.split("/")[1] || "file";
				return `file.${extension}`;
			}
			return "Base64 file";
		}

		try {
			const urlObj = new URL(url);
			const pathname = urlObj.pathname;
			return pathname.split("/").pop() || "Uploaded file";
		} catch {
			return url.split("/").pop() || "Uploaded file";
		}
	};

	useEffect(() => {
		if (file instanceof File) {
			setFileName(file.name);
			// Check if File object is an image by type
			if (file.type.startsWith("image/")) {
				setIsImage(true);
				const url = URL.createObjectURL(file);
				setImageUrl(url);
				return () => URL.revokeObjectURL(url);
			} else {
				// Fallback to extension check
				setIsImage(isImageFile(file.name));
				if (isImageFile(file.name)) {
					const url = URL.createObjectURL(file);
					setImageUrl(url);
					return () => URL.revokeObjectURL(url);
				}
			}
		} else if (file && typeof file === "object" && "key" in file) {
			// Handle server-side file reference
			const name = getFileNameFromUrl(file.key);
			setFileName(name);
			if (file.url) {
				// Handle base64 data URLs
				if (isBase64DataUrl(file.url)) {
					if (isBase64Image(file.url)) {
						setIsImage(true);
						setImageUrl(file.url);
					} else {
						setIsImage(false);
					}
				} else {
					// Handle regular URLs
					// Check extension first
					if (isImageFile(name)) {
						setIsImage(true);
						setImageUrl(file.url);
					} else {
						// Fetch to check content-type
						fetch(file.url, { method: "HEAD" })
							.then((response) => {
								const contentType = response.headers.get("content-type");
								if (contentType && contentType.startsWith("image/")) {
									setIsImage(true);
									setImageUrl(file.url || null);
								}
							})
							.catch(() => {
								// If fetch fails, fall back to extension check
								setIsImage(false);
							});
					}
				}
			}
		}
	}, [file]);

	if (file && typeof file === "object" && "key" in file) {
		if (!file.url) {
			throw new Error(
				"FileInput: File object must have a url property to be able to render it",
			);
		}
	}

	return (
		<div className="self-start inline-flex flex-col items-center gap-2 border border-gray-200 rounded-md relative">
			{isImage && imageUrl ? (
				<img
					src={imageUrl}
					alt={file instanceof File ? file.name : fileName}
					className="w-20 h-20 object-cover rounded"
				/>
			) : (
				<FileIcon className="w-20 h-20 text-gray-400 my-4" />
			)}
			{!isImage && (
				<div className="flex-1 bg-gray-200 absolute left-0 right-0 bottom-0 w-full overflow-hidden px-1">
					<span className="text-sm font-medium truncate block" title={fileName}>
						{fileName}
					</span>
				</div>
			)}
			<button
				className={`
          text-sm text-gray-500 hover:text-gray-700 absolute top-[-4px]
          right-[-4px] bg-white rounded-full p-[2px] border-[1px] border-gray-500
        `}
				onClick={onRemove}
				type="button"
			>
				<XIcon className="w-3 h-3" />
			</button>
		</div>
	);
}
