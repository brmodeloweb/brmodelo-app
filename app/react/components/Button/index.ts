import { react2angular } from "react2angular";
import angular from "angular";
import Button from "./Button";

export { Button };
export default angular
	.module("app.react.button", [])
	.component("reactButton", react2angular(Button, ["label", "onClick", "type"]))
	.name;
