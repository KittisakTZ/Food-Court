import HomePage from "@/pages/home";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Error404 from "@/components/layouts/layout.error404";

// customer route
import CustomerCharacter from "@/pages/Customer/customer-character";


import LoginPage from "@/pages/login";
import MainLayout from "@/components/layouts/layout";


const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    // element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "customer-character",
        element: <CustomerCharacter/>,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "*",
    element: <Error404 />,
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
