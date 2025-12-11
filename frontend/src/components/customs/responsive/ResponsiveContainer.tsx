// @/components/customs/responsive/ResponsiveContainer.tsx

import { ReactNode } from 'react';
import { useScreenSize } from '@/hooks/use-mobile';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
}

/**
 * Component สำหรับจัดการ responsive design ให้ง่ายขึ้น
 * @param children - เนื้อหาภายใน container
 * @param className - CSS class พื้นฐานที่ใช้กับทุกขนาดหน้าจอ
 * @param mobileClassName - CSS class เพิ่มเติมสำหรับ mobile
 * @param tabletClassName - CSS class เพิ่มเติมสำหรับ tablet
 * @param desktopClassName - CSS class เพิ่มเติมสำหรับ desktop
 */
export const ResponsiveContainer = ({
  children,
  className = '',
  mobileClassName = '',
  tabletClassName = '',
  desktopClassName = '',
}: ResponsiveContainerProps) => {
  const { isMobile, isTablet } = useScreenSize();

  const responsiveClass = isMobile
    ? mobileClassName
    : isTablet
    ? tabletClassName
    : desktopClassName;

  return (
    <div className={`${className} ${responsiveClass}`.trim()}>
      {children}
    </div>
  );
};

interface ResponsiveTextProps {
  children: ReactNode;
  className?: string;
  mobileSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  tabletSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  desktopSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

const textSizeMap = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
};

/**
 * Component สำหรับจัดการขนาดข้อความตาม responsive
 */
export const ResponsiveText = ({
  children,
  className = '',
  mobileSize = 'base',
  tabletSize = 'lg',
  desktopSize = 'xl',
}: ResponsiveTextProps) => {
  const { isMobile, isTablet } = useScreenSize();

  const sizeClass = isMobile
    ? textSizeMap[mobileSize]
    : isTablet
    ? textSizeMap[tabletSize]
    : textSizeMap[desktopSize];

  return <span className={`${className} ${sizeClass}`.trim()}>{children}</span>;
};

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  mobileCols?: 1 | 2 | 3;
  tabletCols?: 2 | 3 | 4;
  desktopCols?: 3 | 4 | 5 | 6;
  gap?: 2 | 3 | 4 | 5 | 6;
}

const gridColsMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};

const gapMap = {
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
};

/**
 * Component Grid ที่รองรับ responsive
 */
export const ResponsiveGrid = ({
  children,
  className = '',
  mobileCols = 1,
  tabletCols = 2,
  desktopCols = 3,
  gap = 4,
}: ResponsiveGridProps) => {
  return (
    <div
      className={`grid ${gridColsMap[mobileCols]} sm:${gridColsMap[tabletCols]} lg:${gridColsMap[desktopCols]} ${gapMap[gap]} ${className}`.trim()}
    >
      {children}
    </div>
  );
};
