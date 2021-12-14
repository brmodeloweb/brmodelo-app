import { DefaultTheme, defaultTheme } from "@xstyled/styled-components";

export type Sizes = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

// default theme reference: https://github.com/gregberge/xstyled/blob/main/packages/system/src/defaultTheme.ts
const theme = {
	...defaultTheme,
	colors: {
		...defaultTheme.colors,
		"primary-500": "#3d9970",
		"secondary-500": "#dd7c58",

		"cool-gray-100": "#f8f8f8",
		"cool-gray-200": "#e7e7e7",
	},
	shadows: {
		...defaultTheme.shadows,
		default: "0 0 20px rgb(0, 0, 0, 0.1)",
	},
	sizes: {
		...defaultTheme.sizes,
		xs: "22rem",
		sm: "28rem",
		md: "32rem",
		lg: "36rem",
		xl: "42rem",
		"2xl": "48rem",
	},
	fonts: {
		mono: `"Fira Sans", sans-serif`,
		sans: `"Fira Sans", sans-serif`,
		serif: `"Fira Sans", sans-serif`,
	},
};

export default theme;
