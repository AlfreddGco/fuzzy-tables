import { defineConfig } from "tsup";

export default defineConfig([
	// Main bundle with "use client"
	{
		entry: ["src/index.ts"],
		format: ["cjs", "esm"],
		dts: true,
		splitting: false,
		sourcemap: true,
		clean: true,
		external: ["react", "react-dom"],
		injectStyle: true,
		esbuildOptions(options) {
			options.banner = {
				js: '"use client";',
			};
			options.loader = {
				...options.loader,
				".scss": "css",
			};
		},
	},
	// Types bundle without "use client"
	{
		entry: ["src/type-utils.ts"],
		format: ["cjs", "esm"],
		dts: true,
		splitting: false,
		sourcemap: true,
		clean: false, // Don't clean since the main bundle already did
		external: ["react", "react-dom", "zod", "lodash"],
	},
]);
