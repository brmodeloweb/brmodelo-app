import LocaleNamespaces from "@enums/localeNamespaces";
import i18n, { Resource } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import commonTranslationEN from "../public/locales/en/common.json";
import commonTranslationPTBR from "../public/locales/pt-BR/common.json";

const resources: Resource = {
	en: {
		common: commonTranslationEN,
	},
	"pt-BR": {
		common: commonTranslationPTBR,
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
		detection: {
			order: ["localStorage", "navigator"],
			lookupLocalStorage: "i18n",
			caches: ["localStorage"],
		},
	});

export default i18n;
