import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@fontsource-variable/libre-franklin";
import "@fontsource-variable/museomoderno";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
