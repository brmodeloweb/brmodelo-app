import React from "react";
import { Sizes } from "theme";
import { CardContainer } from "./styles";

export interface CardProps {
	size?: Sizes;
}

const Card: React.FC<CardProps> = ({ size, children }) => {
	return <CardContainer size={size}>{children}</CardContainer>;
};

export default Card;
