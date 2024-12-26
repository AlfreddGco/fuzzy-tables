import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["cjs", "esm"],
	dts: true,
	splitting: false,
	sourcemap: true,
	clean: true,
	external: ["react", "react-dom", "styled-components"],
	injectStyle: true,
	esbuildOptions(options) {
		options.banner = {
			js: '"use client";',
		};
	},
});
