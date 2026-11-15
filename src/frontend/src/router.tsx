import { createBrowserRouter, Link } from "react-router";
import { ErrorState } from "@/components/ErrorState";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { BookingPage } from "@/pages/BookingPage";
import { CourtPage } from "@/pages/CourtPage";
import { FindBookingPage } from "@/pages/FindBookingPage";
import { HomePage } from "@/pages/HomePage";

function NotFound() {
  return (
    <ErrorState
      title="Página no encontrada"
      message="La dirección que abriste no existe."
      action={
        <Button asChild>
          <Link to="/">Ir al inicio</Link>
        </Button>
      }
    />
  );
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/canchas/:courtId", element: <CourtPage /> },
      { path: "/reserva/:code", element: <BookingPage /> },
      { path: "/mi-reserva", element: <FindBookingPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
