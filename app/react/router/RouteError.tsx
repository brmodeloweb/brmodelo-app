import React from "react";
import styled from "styled-components";
import { useRouteError } from "react-router-dom";

const Container = styled.section`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	padding: 24px;
	gap: 12px;
	text-align: center;
`;

const RouteError: React.FC = () => {
	const error = useRouteError();
	const message = error instanceof Error ? error.message : "Unexpected error";

	return (
		<Container>
			<h1>Something went wrong</h1>
			<p>{message}</p>
			<a className="br-button" href="/">Reload</a>
		</Container>
	);
};

export default RouteError;
