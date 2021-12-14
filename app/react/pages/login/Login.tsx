import Button from "@components/Button";
import Card from "@components/Card";
import { Flex } from "@components/Layout";
import Logo from "@components/Logo";
import Heading from "@components/Typography/Heading/Heading";
import BasePage from "@containers/BasePage";
import LocaleNamespaces from "@i18n/LocaleNamespaces";
import { useTranslation } from "react-i18next";
import { PageContainer } from "./styles";

const Login = () => {
	const { t } = useTranslation(LocaleNamespaces.LOGIN);

	return (
		<BasePage>
			<PageContainer>
				<Card w="lg">
					<Flex alignItems="center" justifyContent="center" spaceX={4} mb={9}>
						<Logo />
						<Heading color="primary-500">{t("BR Modelo Web")}</Heading>
					</Flex>
					<Flex flexDirection="column">
						<Button
							variant="outline"
							textTransform="uppercase"
							onClick={console.log}
						>
							Entrar
						</Button>
						<Button variant="link" onClick={console.log}>
							Recuperar Senha
						</Button>
						<Button variant="solid" onClick={console.log}>
							Criar conta
						</Button>
					</Flex>
				</Card>
			</PageContainer>
		</BasePage>
	);
};

export default Login;
