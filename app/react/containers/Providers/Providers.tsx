import i18n from "i18n";
import PropTypes from "prop-types";
import React from "react";
import { I18nextProvider } from "react-i18next";
import { ThemeProvider } from "styled-components";
import theme from "../../theme";

const Providers: React.FC = ({ children }) => {
	return (
		<ThemeProvider theme={theme}>
			<I18nextProvider i18n={i18n}>{children}</I18nextProvider>
		</ThemeProvider>
	);
};

Providers.propTypes = {
	children: PropTypes.element.isRequired,
};

export default Providers;
