import Card from "@components/Card";
import BasePage from "@containers/BasePage";
import { PageContainer } from "./styles";

interface Props {}

const Login = (props: Props) => {
	return (
		<BasePage>
			<PageContainer>
				<Card size="md">Login</Card>
			</PageContainer>
		</BasePage>
	);
};

export default Login;
