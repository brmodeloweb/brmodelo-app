import i18n from "i18n";
import PropTypes from "prop-types";
import React from "react";
import { I18nextProvider } from "react-i18next";
import { ThemeProvider } from "styled-components";
import theme from "../../theme";

type ProviderProps = {
	children: JSX.Element;
};

const Providers: React.FC<ProviderProps> = ({
	children
}) => {
	return (
		<ThemeProvider theme={theme}>
			<I18nextProvider i18n={i18n}>{children}</I18nextProvider>
		</ThemeProvider>
	);
};

export default Providers;
