import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "util";

// jsdom doesn't expose fetch/Request/Response globals. React Router 6.4+ data
// router uses these internally; whatwg-fetch polyfills the missing pieces.
require("whatwg-fetch");

// React Router 7 imports TextEncoder/TextDecoder at module load time; jsdom
// doesn't provide them.
if (typeof globalThis.TextEncoder === "undefined") {
	globalThis.TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === "undefined") {
	globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;
}
