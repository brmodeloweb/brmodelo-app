import React from "react";
import { Outlet, Navigate, createBrowserRouter } from "react-router-dom";
import Providers from "../containers/Providers";
import RouteTitle from "./RouteTitle";
import RouteError from "./RouteError";
import RouteLoading from "./RouteLoading";

const Layout: React.FC = () => (
	<Providers>
		<RouteTitle />
		<Outlet />
	</Providers>
);

const lazy = (loader: () => Promise<{ default: React.ComponentType }>) => async () => ({
	Component: (await loader()).default,
});

const router = createBrowserRouter([
	{
		element: <Layout />,
		errorElement: <Providers><RouteError /></Providers>,
		HydrateFallback: RouteLoading,
		children: [
			{
				path: "/",
				lazy: lazy(() => import("../pages/workspace/WorkspacePageWrapper")),
			},
			{
				path: "/conceptual/:modelid",
				lazy: lazy(() => import("../pages/conceptual/ConceptualPageWrapper")),
			},
			{
				path: "/logic/:modelid",
				lazy: lazy(() => import("../pages/logic/LogicPageWrapper")),
			},
			{
				path: "/nosql/:modelid",
				lazy: lazy(() => import("../pages/nosql/NoSqlPageWrapper")),
			},
			{
				path: "*",
				element: <Navigate to="/" replace />,
			},
		],
	},
]);

export default router;
