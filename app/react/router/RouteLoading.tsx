import React from "react";
import styled from "styled-components";
import loadingDots from "../../img/loading-dots.gif";

const Container = styled.section`
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
`;

const RouteLoading: React.FC = () => (
	<Container>
		<img src={loadingDots} alt="Loading" />
	</Container>
);

export default RouteLoading;
