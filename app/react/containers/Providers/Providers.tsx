import React from "react";
import PropTypes from "prop-types";
import { ThemeProvider } from "styled-components";
import theme from "../../theme";

const Providers: React.FC = ({ children }) => {
	return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

Providers.propTypes = {
	children: PropTypes.element.isRequired,
};

export default Providers;
