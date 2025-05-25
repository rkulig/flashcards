import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Konfiguracja serwera MSW dla testów jednostkowych
export const server = setupServer(...handlers);
