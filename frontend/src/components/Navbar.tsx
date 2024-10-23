import React, { useState, useEffect } from "react";
import { Avatar, Dropdown, Navbar as FlowbiteNavbar, DarkThemeToggle, Badge } from "flowbite-react";
import { removeToken as removeLocalToken } from "../services/LocalStorageService";
import { logOut } from "../features/authSlice";
import { toast } from "react-toastify";
import { Link, useLocation } from "react-router-dom";
import { setMode } from "../features/darkModeSlice";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getCurrentToken } from "../features/authSlice";
import { removeToken } from "../services/auth";
import { motion, AnimatePresence } from "framer-motion";
import { FaHome, FaChartLine, FaUserCircle, FaInfoCircle, FaEnvelope, FaSignOutAlt, FaCog, FaBell } from "react-icons/fa";

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const access_token = useAppSelector(getCurrentToken);
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications] = useState(3); // Example notification count

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const signOut = () => {
    removeToken();
    removeLocalToken();
    dispatch(logOut());
    toast.success("Logged Out Successfully");
  };

  const handleThemeToggle = () => {
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
    <FlowbiteNavbar fluid className={`sticky top-0 z-30 transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-md dark:bg-gray-800/80" : "bg-white dark:bg-gray-800"} shadow-md`}>
      <FlowbiteNavbar.Brand as={Link} to="/" className="flex items-center space-x-3">
        <img src="/vite.svg" className="h-8" alt="ICICI Breeze Logo" />
        <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">ICICI Breeze</span>
      </FlowbiteNavbar.Brand>
      <div className="flex items-center space-x-3 md:order-2">
        <DarkThemeToggle onClickCapture={handleThemeToggle} className="focus:ring-2 focus:ring-blue-300" />
        <motion.div>
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <div className="relative">
                <FaBell className="w-6 h-6 text-gray-500 transition-colors duration-200 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" />
                {notifications > 0 && (
                  <Badge color="failure" className="absolute -top-2 -right-2">
                    {notifications}
                  </Badge>
                )}
              </div>
            }
          >
            <Dropdown.Header>
              <span className="block text-sm font-medium">Notifications</span>
            </Dropdown.Header>
            <Dropdown.Item icon={FaBell}>New feature available</Dropdown.Item>
            <Dropdown.Item icon={FaBell}>Security update</Dropdown.Item>
            <Dropdown.Item icon={FaBell}>Account activity</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item icon={FaCog}>Manage notifications</Dropdown.Item>
          </Dropdown>
        </motion.div>
        <motion.div>
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
            <Dropdown.Item icon={FaHome}>
              <Link to={"/dashboard"}>Dashboard</Link>
            </Dropdown.Item>
            <Dropdown.Item icon={FaUserCircle}>
              <Link to={"/profile"}>Profile</Link>
            </Dropdown.Item>
            <Dropdown.Item icon={FaChartLine}>Analytics</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item icon={FaSignOutAlt} onClick={signOut} className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900">
              Sign out
            </Dropdown.Item>
          </Dropdown>
        </motion.div>
        <FlowbiteNavbar.Toggle />
      </div>
      <FlowbiteNavbar.Collapse>
        <AnimatePresence>
          {navItems.map((item) => (
            <motion.div key={item.path} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <FlowbiteNavbar.Link
                as={Link}
                to={item.path}
                active={location.pathname === item.path}
                className="flex items-center space-x-2 transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </FlowbiteNavbar.Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </FlowbiteNavbar.Collapse>
    </FlowbiteNavbar>
  );
};

export default Navbar;
