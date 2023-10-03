import React, { MouseEventHandler, ReactNode } from "react";

enum ButtonTypes {
	BUTTON = "button",
	SUBMIT = "submit",
	RESET = "reset",
}

type ButtonProps = {
	label?: string;
	type?: ButtonTypes;
	onClick: MouseEventHandler<HTMLButtonElement>;
	children: ReactNode;
};

const Button: React.FC<ButtonProps> = ({
	label,
	onClick,
	type = ButtonTypes.BUTTON,
	children,
}) => {
	return (
		<button type={type} onClick={onClick} className="br-button btn-block">
			{children ?? label}
		</button>
	);
};

export default Button;
