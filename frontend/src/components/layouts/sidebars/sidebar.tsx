import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { IconType } from "react-icons/lib";
import "../styles/sidebar.css";
import SideBarItems from "./sidebar-items";
import SidebarItemFooter from "./sidebar-item-footer";
import { useState } from "react";

export type DataSideBar = {
  sidebarHeader?: {
    name: string;
    avatar: string;
    headerItemsName: string;
    items: {
      name: string;
      url: string;
      avatar: string;
      onClick: () => void;
    }[];
  };

  sidebarItems: {
    name: string;
    items: {
      title: string;
      url: string;
      icon: IconType;
      isActive?: boolean;
      disable?: boolean;
      items?: {
        title: string;
        url: string;
      }[];
    }[];
  }[];
  sidebarFooter?: {
    profile?: {
      name: string;
      avatar: string;
    };
    items?: {
      icon: React.ReactNode;
      name: string;
      onClick: () => void;
    }[];
  };
};
type SidebarComponentProps = {
  data: DataSideBar;
};
export function SidebarComponent(props: SidebarComponentProps) {
  const { data } = props;
  const { isMobile } = useSidebar();

  // เก็บสถานะเมนูที่เปิดอยู่
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // ฟังก์ชันสำหรับเปิด/ปิดเมนูย่อย
  const toggleMenu = (title: string) => {
    setOpenMenu(openMenu === title ? null : title);
  };
  return (
    <Sidebar className="border-r-2 border-orange-100 pt-[70px] bg-gradient-to-b from-white to-orange-50/30 z-40">
      {data.sidebarHeader &&
        data.sidebarHeader.items &&
        data.sidebarHeader.items?.length > 0 && (
          <SidebarHeader className="bg-white border-b-2 border-orange-100 p-3">
            <SidebarMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    style={{ boxShadow: "none" }}
                    className="h-16 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 data-[state=open]:bg-gradient-to-r data-[state=open]:from-orange-50 data-[state=open]:to-yellow-50 border-2 border-transparent hover:border-orange-200 data-[state=open]:border-orange-300 transition-all duration-200"
                  >
                    <Avatar className="h-10 w-10 rounded-xl ring-2 ring-orange-200">
                      <AvatarImage src={data.sidebarHeader.avatar} alt={""} />
                      <AvatarFallback className="rounded-xl bg-gradient-to-br from-orange-400 to-yellow-400 text-white font-bold">
                        {data.sidebarHeader.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left leading-tight">
                      <span className="truncate font-bold text-gray-800 text-sm">
                        {data.sidebarHeader.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {data.sidebarHeader.headerItemsName}
                      </span>
                    </div>
                    <div className="ml-auto bg-orange-100 rounded-full p-1.5">
                      <ChevronsUpDown className="size-4 text-orange-600" />
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-2xl shadow-xl border-2 border-orange-100 p-3 animate-in slide-in-from-top-2 duration-200"
                  side={isMobile ? "bottom" : "right"}
                  align="end"
                  sideOffset={8}
                >
                  <div className="px-3 py-2 mb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {data.sidebarHeader.headerItemsName}
                    </p>
                  </div>
                  {data.sidebarHeader.items.map((item, index) => (
                    <React.Fragment key={item.name}>
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onClick={item.onClick}
                          className="cursor-pointer rounded-xl px-3 py-3 hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 focus:bg-gradient-to-r focus:from-orange-50 focus:to-yellow-50 transition-all duration-200 group"
                        >
                          <Avatar className="h-10 w-10 rounded-xl ring-2 ring-orange-200 group-hover:ring-orange-400 transition-all">
                            <AvatarImage src={item.avatar} alt={item.avatar} />
                            <AvatarFallback className="rounded-xl bg-gradient-to-br from-orange-400 to-yellow-400 text-white font-bold">
                              {item.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-3 grid flex-1 text-left leading-tight">
                            <span className="truncate font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                              {item.name}
                            </span>
                            <span className="text-xs text-gray-500 group-hover:text-orange-500 transition-colors">
                              คลิกเพื่อสลับ
                            </span>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      {index + 1 !== data.sidebarHeader?.items.length && (
                        <DropdownMenuSeparator className="bg-orange-100 my-2" />
                      )}
                    </React.Fragment>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenu>
          </SidebarHeader>
        )}
      <SidebarContent className="bg-transparent py-4">
        {data.sidebarItems.map((item) => (
          <SideBarItems key={item.name} navMain={item} />
        ))}
      </SidebarContent>
      <SidebarFooter className="bg-white border-t-2 border-orange-100">
        {data.sidebarFooter?.profile && data.sidebarFooter?.items && (
          <SidebarItemFooter
            user={data.sidebarFooter.profile}
            items={data.sidebarFooter?.items}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
