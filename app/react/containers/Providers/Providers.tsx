import i18n from "i18n";
import React from "react";
import { I18nextProvider } from "react-i18next";
import { ThemeProvider } from "styled-components";
import theme from "../../theme";
import { ModalsProvider } from "../Modals";

type ProviderProps = {
	children: React.ReactNode;
};

const Providers: React.FC<ProviderProps> = ({
	children
}) => {
	return (
		<ThemeProvider theme={theme}>
			<I18nextProvider i18n={i18n}>
				<ModalsProvider>{children}</ModalsProvider>
			</I18nextProvider>
		</ThemeProvider>
	);
};

export default Providers;
