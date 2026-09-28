const js = require("@eslint/js");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const reactPlugin = require("eslint-plugin-react");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
	// Base recommended config
	js.configs.recommended,

	// Global ignores
	{
		ignores: [
			"**/node_modules/**",
			"**/dist/**",
			"**/build/**",
			"app/dist/**",
			"coverage/**",
			"*.min.js"
		]
	},

	// TypeScript and React config for app/react
	{
		files: ["app/react/**/*.{ts,tsx}"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 2020,
				sourceType: "module",
				ecmaFeatures: {
					jsx: true
				},
				project: "./app/react/tsconfig.json"
			},
			globals: {
				window: "readonly",
				document: "readonly",
				navigator: "readonly",
				console: "readonly"
			}
		},
		plugins: {
			"@typescript-eslint": tsPlugin,
			react: reactPlugin
		},
		settings: {
			react: {
				version: "detect"
			}
		},
		rules: {
			...tsPlugin.configs.recommended.rules,
			...reactPlugin.configs.recommended.rules,
			"no-shadow": "off",
			"react/jsx-uses-react": "off",
			"react/react-in-jsx-scope": "off",
			"@typescript-eslint/no-shadow": ["error"],
			"react/jsx-filename-extension": [
				1,
				{
					extensions: [".js", ".jsx", ".ts", ".tsx"]
				}
			]
		}
	},


	// JavaScript config for other files
	{
		files: ["**/*.js"],
		ignores: ["app/react/**"],
		languageOptions: {
			ecmaVersion: 2020,
			sourceType: "module",
			globals: {
				require: "readonly",
				module: "readonly",
				process: "readonly",
				__dirname: "readonly",
				console: "readonly"
			}
		}
	},

	// Prettier config (must be last)
	prettierConfig
];
