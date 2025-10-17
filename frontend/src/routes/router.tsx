import HomePage from "@/pages/home";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Error404 from "@/components/layouts/layout.error404";
import LoginPage from "@/pages/login";
import MainLayout from "@/components/layouts/layout";
import RegisterPage from "@/pages/register";


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
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "*",
    element: <Error404 />,
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
