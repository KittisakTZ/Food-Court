import { Avatar, Box, Flex, Link, Text } from "@radix-ui/themes";
import { useLocalProfileData } from "@/zustand/useProfile";
import SidebarTriggerCustom from "@/components/customs/button/sidebarTriggerCustom";
import MenuItem, { MenuItemType } from './MenuItem';

const menuItems: MenuItemType[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Master",
    href: "/sales",
    children: [
      { label: "Customer", href: "/sales/quotations" },
      { label: "Supplier", href: "/sales/orders" },
      { label: "Item", href: "/sales/customers" },
    ],
  },
  {
    label: "Merchandiser ",
    href: "/inventory",
    children: [
      { label: "Bom", href: "/inventory/products" },
      { label: "Job Order", href: "/inventory/warehouses" },
      { label: "MRP", href: "/inventory/stock-moves" },
    ],
  },
  {
    label: "Reports",
    href: "/reports",
  }
];

const   NavbarProfileInfo = () => {
  const { profile } = useLocalProfileData();
  return (

    <Flex className=" text-main mr-8" align={"center"} gap={"4"}>
      <Box className=" relative">
        <Box className=" w-3 h-3 rounded-full bg-green-600 absolute border-white border-2 bottom-0 right-0"></Box>
        <Avatar
          src="/images/avatar2.png"
          fallback={"/images/avatar2.png"}
          size={"2"}
        />
      </Box>
      <Text className=" text-sm">{profile?.role?.role_name ?? "Admin"}</Text>
    </Flex>
  );
};

const NavbarMain = () => {
  return (
    <Flex
      className="fixed w-full top-0 h-[70px] bg-white z-30"
      justify={"center"}
      align={"center"}
      style={{
        boxShadow: "0 2px 4px rgba(0,0,0,.08)",
      }}
    >
      <Flex
        className="w-full max-w-screen-2xl px-6"
        justify={"between"}
        align={"center"}
      >
        {/* === Left Section === */}
        <Flex align="center" gap="4">
          <SidebarTriggerCustom />
          <Link href={"/"}>
            <Box className="sm:w-[150px] w-[120px]"> {/* ปรับขนาดโลโก้ให้เหมาะสม */}
              {/* <img
                src="/images/logo.png"
                alt="logo-main-website"
                className="hover:cursor-pointer hover:opacity-75 transition-opacity duration-300 h-auto"
              /> */}
            </Box>
          </Link>
        </Flex>

        {/* === Center Section: The New Menu === */}
        <nav className="hidden lg:flex items-center gap-2">
            {menuItems.map((item, index) => (
                <MenuItem key={index} item={item} />
            ))}
        </nav>

        {/* === Right Section === */}
        <NavbarProfileInfo />
      </Flex>
    </Flex>
  );
};

export default NavbarMain;
