import React from "react";
import { Avatar, Dropdown, Navbar as FlowbiteNavbar, DarkThemeToggle } from "flowbite-react";
import { removeToken as removeLocalToken } from "../services/LocalStorageService";
import { logOut } from "../features/authSlice";
import { toast } from "react-toastify";
import { Link, useLocation } from "react-router-dom";
import { setMode } from "../features/darkModeSlice";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getCurrentToken } from "../features/authSlice";
import { FaHome, FaChartLine, FaUserCircle, FaInfoCircle, FaEnvelope } from "react-icons/fa";
import { removeToken } from "../services/auth";

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const access_token = useAppSelector(getCurrentToken);
  const location = useLocation();

  const signOut = () => {
    removeToken();
    removeLocalToken();
    dispatch(logOut());
    toast.success("Logged Out");
  };

  const handleClick = () => {
    console.log(localStorage.getItem("flowbite-theme-mode"));
    setTimeout(() => {
      dispatch(setMode());
    }, 5);
  };

  if (!access_token) return null;

  const navItems = [
    { path: "/", label: "Home", icon: FaHome },
    { path: "/instruments", label: "Instruments", icon: FaChartLine },
    { path: "/accounts", label: "Accounts", icon: FaUserCircle },
    { path: "/about", label: "About", icon: FaInfoCircle },
    { path: "/contact", label: "Contact", icon: FaEnvelope },
  ];

  return (
    <FlowbiteNavbar fluid className="sticky top-0 z-30 transition-all duration-300 bg-white shadow-md dark:bg-gray-800">
      <FlowbiteNavbar.Brand href="#" className="flex items-center space-x-3">
        <img src="/vite.svg" className="h-8" alt="ICICI Breeze Logo" />
        <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">ICICI Breeze</span>
      </FlowbiteNavbar.Brand>
      <div className="flex items-center space-x-3 md:order-2">
        <DarkThemeToggle onClickCapture={handleClick} className="focus:ring-2 focus:ring-blue-300" />
        <Dropdown
          arrowIcon={false}
          inline
          label={
            <Avatar
              alt="User settings"
              img="https://ui-avatars.com/api/?name=Naveed+Khan&background=random"
              rounded
              size="md"
              className="transition-all duration-300 ring-2 ring-blue-500 hover:ring-blue-600"
            />
          }
        >
          <Dropdown.Header>
            <span className="block text-sm font-medium">Naveed Khan</span>
            <span className="block text-sm font-light truncate">admin@gmail.com</span>
          </Dropdown.Header>
          <Dropdown.Item icon={FaHome}>Dashboard</Dropdown.Item>
          <Dropdown.Item icon={FaUserCircle}>Profile</Dropdown.Item>
          <Dropdown.Item icon={FaChartLine}>Analytics</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item icon={FaEnvelope} onClick={signOut} className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900">
            Sign out
          </Dropdown.Item>
        </Dropdown>
        <FlowbiteNavbar.Toggle />
      </div>
      <FlowbiteNavbar.Collapse>
        {navItems.map((item) => (
          <FlowbiteNavbar.Link
            key={item.path}
            as={Link}
            to={item.path}
            active={location.pathname === item.path}
            className="flex items-center space-x-2 transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </FlowbiteNavbar.Link>
        ))}
      </FlowbiteNavbar.Collapse>
    </FlowbiteNavbar>
  );
};

export default Navbar;
