import HomePage from "@/pages/home";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Error404 from "@/components/layouts/layout.error404";
import LoginPage from "@/pages/login";
import MainLayout from "@/components/layouts/layout";
import RegisterPage from "@/pages/register";
import StoreDetailPage from "@/pages/store-detail";
import CheckoutPage from "@/pages/checkout";
import MyOrdersPage from "@/pages/my-orders";
import MenuManagementPage from "@/pages/my-store/menus";
import StoreSettingsPage from "@/pages/my-store/settings";


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
      // (ใหม่) เพิ่ม Route สำหรับหน้ารายละเอียดร้านค้า
      {
        path: "stores/:storeId",
        element: <StoreDetailPage />,
      },
      // (ใหม่) เพิ่ม Route สำหรับหน้า Checkout
      {
        path: "checkout",
        element: <CheckoutPage />,
      },
      // (ใหม่) เพิ่ม Route สำหรับหน้าประวัติการสั่งซื้อ
      {
        path: "my-orders",
        element: <MyOrdersPage />,
      },
      // (ใหม่) เพิ่ม Route สำหรับหน้าจัดการเมนู
      {
        path: "my-store/menus",
        element: <MenuManagementPage />,
      },
      // (ใหม่) เพิ่ม Route สำหรับหน้าตั้งค่าร้านค้า
      {
        path: "my-store/settings",
        element: <StoreSettingsPage />,
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
