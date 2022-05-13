import LocaleNamespaces from "@enums/localeNamespaces";
import i18n, { Resource } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import commonTranslationEN from "../public/locales/en/common.json";
import loginTranslationEN from "../public/locales/en/login.json";
import commonTranslationPTBR from "../public/locales/pt-BR/common.json";
import loginTranslationPTBR from "../public/locales/pt-BR/login.json";

const resources: Resource = {
	en: {
		common: commonTranslationEN,
		login: loginTranslationEN,
	},
	"pt-BR": {
		common: commonTranslationPTBR,
		login: loginTranslationPTBR,
	},
};

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		ns: Object.values(LocaleNamespaces),
		defaultNS: LocaleNamespaces.COMMON,
		debug: process.env.NODE_ENV !== "production",
		fallbackLng: "en",
		interpolation: {
			escapeValue: false,
		},
	});

export default i18n;
