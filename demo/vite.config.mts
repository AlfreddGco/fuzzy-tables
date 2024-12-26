import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
	plugins: [react()],
	server: {
		port: 3000,
	},
	resolve: {
		alias: {
			"fuzzy-tables": resolve(__dirname, "../src"),
		},
	},
	css: {
		modules: {
			// Generate typings for CSS modules
			generateScopedName: "[name]__[local]__[hash:base64:5]",
		},
	},
});
