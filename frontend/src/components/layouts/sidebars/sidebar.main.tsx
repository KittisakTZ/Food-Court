import "./sidebar.css";
import { SidebarItemLogout } from "./sidebarItemLogout";
import { SidebarItem } from "./sidebarItem";
import { IoHomeOutline } from "react-icons/io5";
import { RiProductHuntLine } from "react-icons/ri";
import { FaWpforms } from "react-icons/fa";
import { PiGooglePhotosLogo } from "react-icons/pi";
import { BiCategory } from "react-icons/bi";
import { SidebarMenuItem } from "./sidebarMenuItem";

const SidebarMain = () => {
  const ListSidebarItems: {
    icon: JSX.Element;
    name: string;
    path: string;
    menu?: { icon: JSX.Element; name: string; path: string }[];
    disabled?: boolean;
  }[] = [
    {
      icon: <IoHomeOutline style={{ width: "24px", height: "24px" }} />,
      name: "Dashboard",
      path: `/dashboard`,
      disabled: true,
    },
    // {
    //   icon: <PiGooglePhotosLogo style={{ width: "24px", height: "24px" }} />,
    //   name: "Overdue Payment",
    //   path: `/overdue-payment`,
    //   disabled: true,
    // },
    // {
    //   icon: <PiGooglePhotosLogo style={{ width: "24px", height: "24px" }} />,
    //   name: "Planning",
    //   path: `/planning`,
    //   disabled: true,
    // },
    // {
    //   icon: <PiGooglePhotosLogo style={{ width: "24px", height: "24px" }} />,
    //   name: "Delivery Schedule",
    //   path: `/delivery-schedule`,
    //   disabled: true,
    // },
    // {
    //   icon: <BiCategory style={{ width: "24px", height: "24px" }} />,
    //   name: "Jobs",
    //   path: `/task`,
    //   disabled: true,
    // },
    // {
    //   icon: <RiProductHuntLine style={{ width: "24px", height: "24px" }} />,
    //   name: "Sales",
    //   path: `/sale`,
    //   disabled: true,
    // },
    // {
    //   icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
    //   name: "Master Data",
    //   path: `/master`,
    //   disabled: true,
    // },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Calendar",
      path: `/calendar`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Reasons",
      path: `/ms-issue-reason`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Tools",
      path: `/ms-tool`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Repair Groups",
      path: `/ms-group-repair`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Colors",
      path: `/ms-color`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Customers",
      path: `/ms-customer`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Brands",
      path: `/ms-brand`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Positions",
      path: `/ms-position`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Repair Items",
      path: `/ms-repair`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Vehicle Models",
      path: `/ms-brandmodel`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Manage Branches",
      path: `/ms-companies`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Stores",
      path: `ms-supplier`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Change Assignee",
      path: `/responsible-person`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Late Payment",
      path: `/late-payment`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Jobs",
      path: `/job`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Removal Appointment Calendar",
      path: `/calendar-removal`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Tool Usage Reasons",
      path: `/ms-tooling-reason`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Delivery Bills",
      path: `/delivery-schedule`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Sale",
      path: `/sale`,
      menu: [
        {
          icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
          name: "Quotations",
          path: `/quotation`,
        },
        {
          icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
          name: "Repair Receipts",
          path: `/ms-repair-receipt`,
        },
        {
          icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
          name: "Customer Visits",
          path: `/visiting-customers`,
        },
      ],
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Approve",
      path: `/approve-quotation`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Payment",
      path: `/ms-payment`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Supplier Repair Receipts",
      path: `/get-supplier`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Claim Notes",
      path: `/send-for-a-claim`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Claim Receipts",
      path: `/receive-a-claim`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Register",
      path: `/register`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "__Barcode",
      path: `/barcode`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "clearby",
      path: `/clearby`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Supplier Delivery Notes",
      path: `/supplier-delivery-note`,
    },
    {
      icon: <FaWpforms style={{ width: "24px", height: "24px" }} />,
      name: "Supplier Repair Receipts",
      path: `/supplier-repair-receipt`,
    },
  ];
  return (
    <section
      style={{ boxShadow: "4px 2px 12px 0px #0A0A100F" }}
      className=" sm:w-[256px] w-[64px]  relative z-10 h-[calc(100vh-118px)] "
    >
      <div className="overflow-y-auto overflow-x-hidden h-full">
        {ListSidebarItems.map((item) => {
          return item.menu && item.menu.length > 0 ? (
            <SidebarMenuItem
              key={item.name}
              icon={item.icon}
              name={item.name}
              path={item.path}
              menu={item.menu}
              disabled={item.disabled}
            />
          ) : (
            <SidebarItem
              key={item.name}
              icon={item.icon}
              name={item.name}
              path={item.path}
              disabled={item.disabled}
            />
          );
        })}
      </div>
    </section>
  );
};

export default SidebarMain;
