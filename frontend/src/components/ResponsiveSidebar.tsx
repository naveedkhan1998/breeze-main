// components/ResponsiveSidebar.tsx
import React, { useState } from "react";
import { Button, Card } from "flowbite-react";
import { HiMenu, HiX } from "react-icons/hi";

interface ResponsiveSidebarProps {
  children: React.ReactNode;
  isFullscreen: boolean;
}

const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({ children, isFullscreen }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  // Hide sidebar in fullscreen mode
  if (isFullscreen) return null;

  return (
    <div className="w-full md:w-96">
      {/* Toggle Button for Mobile */}
      <div className="flex justify-end p-2 md:hidden">
        <Button color="light" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Sidebar">
          {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
        </Button>
      </div>
      {/* Sidebar Content */}
      {isOpen && <Card className="hidden overflow-y-auto md:block md:h-full">{children}</Card>}
      {/* Sidebar for Mobile */}
      {isOpen && (
        <div className="block md:hidden">
          <Card className="h-full overflow-y-auto">{children}</Card>
        </div>
      )}
    </div>
  );
};

export default ResponsiveSidebar;
