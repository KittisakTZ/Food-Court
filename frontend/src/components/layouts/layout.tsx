import { Outlet } from "react-router-dom";
import NavbarMain from "./navbars/navbar.main";
import { useEffect } from "react";
import { getAuthStatus, getLogout } from "@/services/auth.service";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { IoIosLogOut } from "react-icons/io";
import { DataSideBar, SidebarComponent } from "./sidebars/sidebar";

import { FaAppStore, FaCartShopping, FaCircleUser } from "react-icons/fa6";
import { IoIosCube,IoIosSettings} from "react-icons/io";
import { GiSellCard } from "react-icons/gi";
import { FaCalendarDay } from "react-icons/fa";

// import { getUserProfie } from "@/services/user.service";
import { useLocalProfileData } from "@/zustand/useProfile";
import { permissionMap } from "@/utils/permissionMap";
import PermissionRedirect from "@/utils/permissionRedirect";

const MainLayout = () => {
  const navigate = useNavigate();
  const { setLocalProfileData, profile } = useLocalProfileData();

  const handleLogout = async () => {
    getLogout()
      .then((response) => {
        if (response.statusCode === 200) {
          navigate("/login");
        } else {
          alert(`Unexpected error: ${response.message}`);
        }
      })
      .catch((error) => {
        console.error(
          "Error creating category:",
          error.response?.data || error.message
        );
        alert("Failed to create category. Please try again.");
      });
  };

  useEffect(() => {
    getAuthStatus()
      .then((response) => {
        if (response.statusCode === 200) {
          if (response.message == "Authentication required") {
            navigate("/login");
          }
        }
      })
      .catch((error) => {
        console.error("Error checking authentication status:", error.message);
      });



    // getUserProfie().then((res) => {
    //   if (res.responseObject) {
    //     setLocalProfileData(res.responseObject);
    //     console.log("response", res);
    //   }
    // });
  }, []);

  const eiditprofile = () => {
    console.log("profile", profile.company_id);
    //navigate('/eidit/companies', { state: { customer_id: profile.company_id} });
    navigate('/eidit/companies', { state: { customer_id: profile.company_id } });
  }

  const rawSidebarItems = [
    
    {
      title: "ลูกค้า",
      url: "",
      icon: FaCircleUser,
      disable: true,
      items: [
        {
          title: "นิสัยลูกค้า",
          url: `/customer-character`,
        },
      ],
    },

  ];

  // ฟังก์ชันกรองเฉพาะเมนูที่ role ของ user มีสิทธิ์ (A หรือ R)
  const filteredSidebarItems = rawSidebarItems
    .map((item) => {
      if (item.items) {
        // ตรวจสอบ permission ของ items ย่อย
        const filteredSubItems = item.items.filter((subItem) => {
          const permission =
            permissionMap[subItem.title]?.[
            profile?.role?.role_name ?? "Admin"
            ] || "N";
          return permission !== "N";
        });

        // ถ้ามี items ที่ผ่านการกรอง ให้สร้าง object ใหม่
        if (filteredSubItems.length > 0) {
          return { ...item, items: filteredSubItems };
        }
      }

      // ตรวจสอบ permission ของเมนูหลัก
      const permission =
        permissionMap[item.title]?.[profile?.role?.role_name ?? "Admin"] || "N";
      if (permission !== "N") {
        return item; // คืนค่าเมนูหลักที่มี permission
      }

      return null; // กรณีที่ไม่มี permission จะคืนค่าเป็น null
    })
    .filter((item) => item !== null); // กรอง null ออกจากอาร์เรย์

  const dataSidebar: DataSideBar = {
    sidebarItems: [
      {
        name: "",
        items: filteredSidebarItems,
      },
    ],
    sidebarFooter: {
      profile: {
        name: (profile?.username ?? "") + " " + (profile?.last_name ?? ""),
        // avatar: profile?.image_url ?? "/images/avatar2.png",
        avatar: "/images/avatar2.png",
      },
      items: [
        {
          icon: <IoIosLogOut className="text-theme-yellow" />,
          name: "ออกจากระบบ",
          onClick: () => {
            console.log("logout");
            handleLogout();
          },

        },

      ],
    },
  };

  return (
    <div className=" relative w-screen h-screen">
      <PermissionRedirect />

      <SidebarProvider
        style={{
          height: "100%",
          width: "100%",
          paddingTop: "70px",
          overflow: "hidden",
          boxShadow: "4px 2px 12px 0px #0A0A100F",
        }}
      >
        <NavbarMain />
        <SidebarComponent data={dataSidebar} />
        <SidebarInset className="m-0 p-0 bg-[#F6F7F9] w-full max-w-full">
          {/* <header className="clas flex shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 p-4">
              <SidebarTriggerCustom />
            </div>
          </header> */}
          <div className=" px-4 py-4 overflow-auto max-h-[calc(100%-70px)]">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default MainLayout;
