import styled, { css } from "styled-components";
import { Sizes } from "theme";
import { CardProps } from "./Card";

export const CardContainer = styled.div<CardProps>`
	${({ size = "md", theme: { sizes, spacings, colors } }) => css`
		width: ${sizes[size]};
		box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
		padding: ${spacings[12]} ${spacings[6]} ${spacings[6]};
		margin: 60px auto 0 auto;
		border: 1px solid ${colors.gray[200]};
		background-color: ${colors.gray[100]};
	`}
`;
