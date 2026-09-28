module.exports = {
	projects: [
		{
			displayName: "react",
			testEnvironment: "jest-environment-jsdom",
			roots: ["app/react"],
			testMatch: ["**/*.test.tsx", "**/*.test.ts", "**/*.test.js"],
			transform: {
				"^.+\\.(tsx?|jsx?)$": ["babel-jest", {
					presets: [
						["@babel/preset-env", { modules: "auto" }],
						"@babel/preset-react",
						"@babel/preset-typescript",
					],
				}],
			},
			moduleNameMapper: {
				"^@joint/core$": "<rootDir>/__mocks__/@joint/core.js",
				"^@services/(.*)$": "<rootDir>/app/react/services/$1",
				"\\.scss$": "<rootDir>/__mocks__/styleMock.js",
				"\\.css$": "<rootDir>/__mocks__/styleMock.js",
				"\\.(gif|png|jpe?g|svg|webp)$": "<rootDir>/__mocks__/fileMock.js",
			},
			setupFilesAfterEnv: ["<rootDir>/app/react/setupTests.ts"],
		},
	],
};
