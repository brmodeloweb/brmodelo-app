import angular from "angular";
import { react2angular } from "react2angular";
import Providers from "./Providers";

export { Providers };
export default angular
	.module("app.react.providers", [])
	.component("reactProviders", react2angular(Providers)).name;
