import styled, { css, th } from "@xstyled/styled-components";

interface InputProps {
	hasError?: boolean;
}

const Input = styled.inputBox<InputProps>`
	${({ color = "primary-500", hasError = false }) => css`
		width: full;
		box-shadow: 0 0 0 ${th.color(color)};
		transition: box-shadow 0.2s;
		background-color: white;
		border: 1px solid;
		font-family: "Fira Sans", sans-serif;
		border-radius: lg;
		font-size: 1.2em;
		height: 46px;
		padding: 3 5;
		&:focus {
			outline: none;
		}
		${hasError
			? css`
					color: red-500-a80;
					border-color: red-500;
					background-color: red-500-a10;
					&:focus {
						box-shadow: 1px 1px 0 ${th.color("red-500-a80")},
							-1px 3px 0 ${th.color("red-500-a80")};
					}
					::placeholder {
						color: red-500;
					}
			  `
			: css`
					color: gray-500;
					border-color: gray-200;
					&:focus {
						outline: none;
						border-color: ${color};
						box-shadow: 1px 1px 0 ${th.color(color)},
							-1px 3px 0 ${th.color(color)};
					}
					::placeholder {
						color: gray-400;
					}
			  `}
	`}
`;

export default Input;
