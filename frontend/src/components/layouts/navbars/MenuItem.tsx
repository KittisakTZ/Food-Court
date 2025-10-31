// @/components/layouts/navbars/MenuItem.tsx

import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

type SubMenuItemType = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export type MenuItemType = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: SubMenuItemType[];
};

interface MenuItemProps {
  item: MenuItemType;
}

const MenuItem = ({ item }: MenuItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubMenu = item.children && item.children.length > 0;

  return (
    <div
      className="relative group"
      onMouseEnter={() => hasSubMenu && setIsOpen(true)}
      onMouseLeave={() => hasSubMenu && setIsOpen(false)}
    >
      <Link
        to={item.href}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 hover:text-orange-600 transition-all duration-200 relative overflow-hidden"
      >
        {/* Icon */}
        {item.icon && <span className="text-lg">{item.icon}</span>}

        {/* Label */}
        <span className="relative z-10">{item.label}</span>

        {/* Chevron for submenu */}
        {hasSubMenu && (
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}

        {/* Hover Effect Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      </Link>

      {/* Dropdown Menu */}
      {hasSubMenu && (
        <div
          className={`absolute top-full left-0 mt-2 w-64 origin-top-left bg-white rounded-2xl shadow-2xl border border-gray-200 focus:outline-none transition-all duration-300 ease-out transform ${
            isOpen
              ? "opacity-100 scale-100 visible translate-y-0"
              : "opacity-0 scale-95 invisible -translate-y-2"
          }`}
        >
          {/* Arrow */}
          <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>

          <div className="py-2 relative z-10 bg-white rounded-2xl">
            {item.children?.map((child, index) => (
              <Link
                key={index}
                to={child.href}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 hover:text-orange-600 transition-all duration-200 first:rounded-t-2xl last:rounded-b-2xl group/item"
              >
                {/* Icon */}
                {child.icon && (
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 group-hover/item:bg-orange-200 transition-colors">
                    {child.icon}
                  </div>
                )}

                {/* Label */}
                <span className="flex-1 font-medium">{child.label}</span>

                {/* Arrow on hover */}
                <svg
                  className="w-4 h-4 text-orange-600 opacity-0 group-hover/item:opacity-100 transform -translate-x-2 group-hover/item:translate-x-0 transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItem;