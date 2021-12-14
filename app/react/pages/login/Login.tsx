import Card from "@components/Card";
import { Box, Flex } from "@components/Layout";
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
					<Flex alignItems="center" justifyContent="center">
						<Logo />
						<Box ml={4}>
							<Heading color="primary-500">{t("BR Modelo Web")}</Heading>
						</Box>
					</Flex>
				</Card>
			</PageContainer>
		</BasePage>
	);
};

export default Login;
