import Button from "@components/Button";
import Card from "@components/Card";
import { Label, Input } from "@components/Form";
import { Box, Divider, Flex } from "@components/Layout";
import Logo from "@components/Logo";
import { Heading } from "@components/Typography";
import BasePage from "@containers/BasePage";
import { useTranslation } from "react-i18next";
import { x } from "@xstyled/styled-components";
import { useForm } from "react-hook-form";
import LocaleNamespaces from "@i18n/LocaleNamespaces";
import Languages from "@i18n/Languages";
import { PageContainer } from "./styles";
import BrFlag from "../../../../img/br-flag.svg";
import UsFlag from "../../../../img/us-flag.svg";

interface LoginProps {
	onSuccess: () => void;
	goToRecoveryPassword: () => void;
	goToCreateAccount: () => void;
}

const Login: React.FC<LoginProps> = ({
	onSuccess,
	goToRecoveryPassword,
	goToCreateAccount,
}) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();

	// @ts-ignore
	const { t, i18n } = useTranslation(LocaleNamespaces.LOGIN);

	const onSubmit = (data: unknown) => {
		console.log("data", data);
		onSuccess();
	};

	return (
		<BasePage>
			<PageContainer>
				<Card w="lg">
					<Flex alignItems="center" justifyContent="center" spaceX={4} mb={9}>
						<Logo />
						<Heading color="primary-500">{t("BR Modelo Web")}</Heading>
					</Flex>
					<form onSubmit={handleSubmit(onSubmit)}>
						<Flex flexDirection="column">
							<Box my={4}>
								<Label>{t("Email")}</Label>
								<Input
									type="email"
									placeholder={t("Email")}
									{...register("email", {
										required: "required",
										pattern: {
											value: /\S+@\S+\.\S+/,
											message: t("Invalid email"),
										},
									})}
									hasError={!!errors.email}
								/>
							</Box>
							<Box mt={2} mb={6}>
								<Label>{t("Password")}</Label>
								<Input
									type="password"
									placeholder={t("Password")}
									{...register("password", {
										required: "required",
									})}
									hasError={!!errors.password}
								/>
							</Box>
							<Button type="submit" variant="outline" textTransform="uppercase">
								{t("Login")}
							</Button>
							<Button variant="link" onClick={goToRecoveryPassword}>
								{t("Recovery password")}
							</Button>
							<Divider />
							<Button variant="solid" onClick={goToCreateAccount}>
								{t("Create account")}
							</Button>
						</Flex>
					</form>
				</Card>
				<Flex alignItems="center" justifyContent="center" mt={16} spaceX={4}>
					<x.img
						src={BrFlag}
						alt="Brazil Flag"
						w="40px"
						cursor="pointer"
						onClick={() => i18n.changeLanguage(Languages.PT_BR)}
					/>
					<x.img
						src={UsFlag}
						alt="USA Flag"
						w="40px"
						cursor="pointer"
						onClick={() => i18n.changeLanguage(Languages.EN)}
					/>
				</Flex>
			</PageContainer>
		</BasePage>
	);
};

export default Login;
