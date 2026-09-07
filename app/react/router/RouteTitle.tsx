import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const titleFor = (pathname: string): string => {
	if (pathname === "/") return "Models list - BRMODELO";
	if (pathname.startsWith("/conceptual/")) return "Conceptual model - BRMW";
	if (pathname.startsWith("/logic/")) return "Logic model - BRMW";
	if (pathname.startsWith("/nosql/")) return "NoSQL model - BRMW";
	return "BRMW";
};

const RouteTitle: React.FC = () => {
	const { pathname } = useLocation();

	useEffect(() => {
		document.title = titleFor(pathname);
	}, [pathname]);

	return null;
};

export default RouteTitle;
