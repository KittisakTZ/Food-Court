import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { IconType } from "react-icons/lib";
import { Link, useLocation } from "react-router-dom";

const SideBarItems = ({
  navMain,
}: {
  navMain: {
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
  };
}) => {
  const location = useLocation();
  const pathname = location.pathname;

  // ใช้ object ในการเก็บ state ของแต่ละเมนู
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  // ฟังก์ชันเปิด/ปิดเมนูย่อย
  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // ตรวจสอบ active class
  const getActiveClass = (url: string) => {
    const currentPathname = pathname.split("?")[0];
    const targetPathname = url.split("?")[0];

    return currentPathname === targetPathname
      ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transform"
      : "text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 hover:text-orange-600 hover:scale-[1.01] transform";
  };

  return (
    <SidebarGroup className="px-2">
      {navMain.name && (
        <SidebarGroupLabel className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">
          {navMain.name}
        </SidebarGroupLabel>
      )}

      <SidebarMenu className="space-y-1">
        {navMain.items.map((item) => {
          const isOpen = openMenus[item.title] || false;
          const isActive = pathname.split("?")[0] === item.url.split("?")[0];

          return item.items && item.items.length > 0 ? (
            <Collapsible key={item.title} asChild open={isOpen}>
              <SidebarMenuItem className="focus:border-none focus:outline-none">
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className={`sidebar-item-custom transition-all duration-300 ease-out rounded-xl ${
                      item.disable ? "opacity-50 cursor-not-allowed" : ""
                    } ${getActiveClass(item.url)} h-11 px-4 my-0.5 group relative overflow-hidden`}
                    onClick={() => !item.disable && toggleMenu(item.title)}
                    disabled={item.disable}
                  >
                    {/* Background animation overlay */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-yellow-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl -z-10"></div>
                    )}

                    <div className={`flex items-center justify-center w-5 h-5 transition-all duration-300 ${
                      isActive ? 'text-white scale-110' : 'text-orange-500 group-hover:text-orange-600 group-hover:scale-110'
                    }`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className={`font-medium transition-all duration-300 ${
                      isActive ? 'text-white' : 'text-gray-700 group-hover:text-orange-700 group-hover:font-semibold'
                    }`}>
                      {item.title}
                    </span>

                    <SidebarMenuAction
                      className={`transition-all duration-300 ${
                        isOpen ? "rotate-90 scale-110" : "rotate-0"
                      } ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-orange-600'}`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </SidebarMenuAction>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="ml-6 mt-1 space-y-0.5">
                    {item.items.map((subItem) => {
                      const isSubActive = pathname.split("?")[0] === subItem.url.split("?")[0];
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            className={`transition-all duration-300 ease-out rounded-lg relative overflow-hidden group ${
                              isSubActive
                                ? 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 font-bold border-l-4 border-orange-500 shadow-sm'
                                : 'text-gray-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 hover:text-orange-700 hover:border-l-4 hover:border-orange-400 hover:font-semibold hover:shadow-sm'
                            } h-9 pl-4`}
                          >
                            <Link to={subItem.url}>
                              <span className={`text-sm transition-all duration-300 ${
                                isSubActive ? 'text-orange-700' : 'text-gray-600 group-hover:text-orange-700'
                              }`}>
                                {subItem.title}
                              </span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className={`sidebar-item-custom transition-all duration-300 ease-out rounded-xl relative overflow-hidden ${
                  item.disable ? "opacity-50 cursor-not-allowed" : ""
                } ${getActiveClass(item.url)} h-11 px-4 my-0.5 group`}
                disabled={item.disable}
              >
                <Link to={item.url} className={item.disable ? 'pointer-events-none' : ''}>
                  {/* Background animation overlay */}
                  {pathname.split("?")[0] !== item.url.split("?")[0] && !item.disable && (
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-yellow-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl -z-10"></div>
                  )}

                  <div className={`flex items-center justify-center w-5 h-5 transition-all duration-300 ${
                    pathname.split("?")[0] === item.url.split("?")[0]
                      ? 'text-white scale-110'
                      : 'text-orange-500 group-hover:text-orange-600 group-hover:scale-110'
                  }`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className={`font-medium transition-all duration-300 ${
                    pathname.split("?")[0] === item.url.split("?")[0]
                      ? 'text-white'
                      : 'text-gray-700 group-hover:text-orange-700 group-hover:font-semibold'
                  }`}>
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default SideBarItems;
