import styled, { css } from "@xstyled/styled-components";

type Variant = "solid" | "outline" | "link";

interface ButtonProps {
	variant?: Variant;
}

const Button = styled.buttonBox<ButtonProps>`
	display: inline-block;
	font-family: "Fira Sans", sans-serif;
	font-size: 1.2em;
	padding: 4 8;
	font-weight: normal;
	border-radius: default;
	transition: all 0.25s ease;
	${({ variant, color = "primary-500" }) => {
		switch (variant) {
			case "outline":
				return css`
					background-color: transparent;
					border: 1px solid;
					border-color: ${color};
					color: ${color};
					&:hover {
						background-color: ${color};
						color: white;
					}
				`;
			case "link":
				return css`
					background-color: transparent;
					height: auto;
					color: ${color};
					&:hover {
						text-decoration: underline;
					}
				`;
			case "solid":
			default:
				return css`
					background-color: ${color};
					border: 1px solid;
					border-color: ${color};
					color: white;
					&:hover {
						background-color: transparent;
						color: ${color};
					}
				`;
		}
	}}
`;

export default Button;
