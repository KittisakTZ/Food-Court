import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, Box } from "@radix-ui/themes";
import { ReactNode } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

const SidebarItemFooter = ({
  user,
  items,
}: {
  user: {
    name: string;
    avatar: string;
  };
  items: {
    icon: ReactNode;
    name: string;
    onClick: () => void;
  }[];
}) => {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu className="p-2">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-16 hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 data-[state=open]:bg-gradient-to-r data-[state=open]:from-orange-50 data-[state=open]:to-yellow-50 rounded-xl border-2 border-transparent hover:border-orange-200 data-[state=open]:border-orange-300 transition-all duration-200 group"
            >
              <Box className="relative">
                <div className="relative">
                  <Avatar
                    src={user.avatar}
                    alt={user.name}
                    fallback={"/images/avatar2.png"}
                    width={"40px"}
                    height={"40px"}
                    style={{ maxWidth: "40px", maxHeight: "40px", borderRadius: "12px" }}
                    className="ring-2 ring-orange-200 group-hover:ring-orange-400 transition-all"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
              </Box>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-bold text-gray-800 group-hover:text-orange-600 transition-colors text-sm">
                  {user.name}
                </span>
                <span className="text-xs text-gray-500 group-hover:text-orange-500 transition-colors">
                  ออนไลน์
                </span>
              </div>
              <div className="ml-auto bg-orange-100 group-hover:bg-orange-200 rounded-full p-1.5 transition-all">
                <MdOutlineKeyboardArrowDown className="size-4 text-orange-600 group-hover:rotate-180 transition-transform duration-300" />
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-2xl shadow-xl border-2 border-orange-100 p-2 animate-in slide-in-from-bottom-2 duration-200"
            side={isMobile ? "bottom" : "top"}
            align="end"
            sideOffset={8}
          >
            {items?.map((item, index) => (
              <DropdownMenuItem
                onClick={item.onClick}
                key={item.name}
                className="cursor-pointer rounded-xl px-4 py-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 focus:bg-gradient-to-r focus:from-red-50 focus:to-orange-50 transition-all duration-200 group mb-1"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex items-center justify-center w-9 h-9 bg-red-100 group-hover:bg-red-200 rounded-lg transition-colors">
                    {item.icon}
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-red-600 transition-colors">
                    {item.name}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default SidebarItemFooter;
