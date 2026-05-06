import angular from "angular";

const themeService = function ($window, $document) {
	const service = this;
	const storageKey = "brmw-theme";
	const themes = {
		light: "light",
		dark: "dark",
	};

	const getBody = () => $document[0].body;

	service.getTheme = () => {
		return $window.localStorage.getItem(storageKey) || themes.light;
	};

	service.applyTheme = (theme) => {
		const selectedTheme = theme === themes.dark ? themes.dark : themes.light;
		const body = getBody();

		body.classList.toggle("theme-dark", selectedTheme === themes.dark);
		body.classList.toggle("theme-light", selectedTheme === themes.light);
		$window.localStorage.setItem(storageKey, selectedTheme);

		return selectedTheme;
	};

	service.toggleTheme = () => {
		const nextTheme = service.getTheme() === themes.dark ? themes.light : themes.dark;
		return service.applyTheme(nextTheme);
	};
};

export default angular.module("app.themeService", []).service("ThemeService", themeService).name;
