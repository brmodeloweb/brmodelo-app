import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

const IconWrapper = styled.div`
	position: relative;
	display: inline-block;

	svg {
		display: block;
	}
`;

type NoSqlIconProps = {
	height?: string;
	className?: string;
};

const NoSqlIcon: React.FC<NoSqlIconProps> = React.memo(({
	height = "20",
	className
}) => {
	const { t } = useTranslation(["common"]);

	return (
		<IconWrapper className={className} title={t("NoSQL model")}>
			<svg xmlns="http://www.w3.org/2000/svg" height={height} viewBox="0 -960 960 960">
				<path d="M320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h280l200 200v360q0 33-23.5 56.5T720-240H320Zm240-400v-160H320v480h400v-320H560ZM160-80q-33 0-56.5-23.5T80-160v-520q0-17 11.5-28.5T120-720q17 0 28.5 11.5T160-680v520h440q17 0 28.5 11.5T640-120q0 17-11.5 28.5T600-80H160Z" />
			</svg>
		</IconWrapper>
	);
});

NoSqlIcon.displayName = 'NoSqlIcon';
export default NoSqlIcon;
