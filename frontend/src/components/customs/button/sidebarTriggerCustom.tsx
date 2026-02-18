import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { GiHamburgerMenu } from "react-icons/gi";

const SidebarTriggerCustom = () => {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className="h-10 w-10 hover:bg-orange-100 hover:text-orange-600 text-orange-500 transition-all duration-300 rounded-xl group"
      onClick={() => {
        toggleSidebar();
      }}
    >
      <GiHamburgerMenu className="w-5 h-5 group-hover:scale-110 transition-transform" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
};
export default SidebarTriggerCustom;
