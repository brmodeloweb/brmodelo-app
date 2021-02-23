import React from "react";

const Button = ({ label, onClick, type }) => {
	return <button type={type} onClick={onClick} className="br-button btn-block">{label}</button>;
};

import PropTypes from "prop-types";

Button.propTypes = {
	label: PropTypes.string.isRequired,
	type: PropTypes.oneOf(['button', 'submit', 'reset']),
	onClick: PropTypes.func,
};

Button.defaultProps = {
	type: 'button',
	onClick: () => {},
};

export default Button;
