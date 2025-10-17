import { Link } from '@radix-ui/themes';
import { ChevronDown } from 'lucide-react';

type SubMenuItemType = {
  label: string;
  href: string;
};
export type MenuItemType = {
  label: string;
  href: string;
  children?: SubMenuItemType[];
};
interface MenuItemProps {
  item: MenuItemType;
}

const MenuItem = ({ item }: MenuItemProps) => {
  const hasSubMenu = item.children && item.children.length > 0;

  return (
    <div className="relative group pb-2">
      <Link 
        href={item.href}
        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-gray-600 group-hover:bg-gray-100 group-hover:text-gray-900 transition-colors duration-200"
      >
        <span>{item.label}</span>
        {hasSubMenu && (
          <ChevronDown
            size={16}
            className="transition-transform duration-200 group-hover:rotate-180"
          />
        )}
      </Link>

      {/* Dropdown Menu */}
      {hasSubMenu && (
        <div
          className="absolute top-full left-0 w-56 origin-top-left bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-200 ease-out transform opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible"
        >
          <div className="py-1">
            {item.children?.map((child, index) => (
              <Link
                key={index}
                href={child.href}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItem;