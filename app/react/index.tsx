import "bootstrap/dist/css/bootstrap.css";
import "../sass/app.scss";
import "./icons";

import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./i18n";
import router from "./router";

const container = document.getElementById("root");
if (!container) throw new Error("Missing #root element");
const root = createRoot(container);
root.render(<RouterProvider router={router} />);
