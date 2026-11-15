import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router/dom";
import { Toaster } from "sonner";
import { router } from "./router";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 10_000 } },
});

const root = document.getElementById("root");
if (!root) throw new Error("No se encontró el elemento #root");

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-center" closeButton />
    </QueryClientProvider>
  </StrictMode>,
);
