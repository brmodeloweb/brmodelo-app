import PropTypes from "prop-types";
import React from "react";
import { I18nextProvider } from "react-i18next";
import { ThemeProvider, Preflight } from "@xstyled/styled-components";
import GlobalStyles from "@styles/GlobalStyles";
import theme from "@styles/theme";
import i18n from "../../i18n";

const BasePage: React.FC = ({ children }) => {
	return (
		<ThemeProvider theme={theme}>
			<GlobalStyles />
			<Preflight />
			<I18nextProvider i18n={i18n}>{children}</I18nextProvider>
		</ThemeProvider>
	);
};

BasePage.propTypes = {
	children: PropTypes.element.isRequired,
};

export default BasePage;
