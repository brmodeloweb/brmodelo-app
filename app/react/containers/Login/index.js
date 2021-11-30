import angular from "angular";
import { react2angular } from "react2angular";
import Login from "./Login";

export { Login };
export default angular
	.module("app.react.login", [])
	.component("reactLoginPage", react2angular(Login)).name;
