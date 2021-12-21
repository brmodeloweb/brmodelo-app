import "react-i18next";
import { defaultNS, resources } from "@i18n/index";

declare module "react-i18next" {
	interface CustomTypeOptions {
		defaultNS: typeof defaultNS;
		resources: typeof resources["en"];
	}
}
