import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getCurrentToken, logOut } from "../features/authSlice";
import { setMode } from "../features/darkModeSlice";
import { removeToken as removeLocalToken } from "../services/LocalStorageService";
import { toast } from "react-toastify";
import { FaBars, FaSignOutAlt, FaUserCircle, FaHome, FaChartLine, FaInfoCircle, FaEnvelope } from "react-icons/fa";

import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { MoonIcon, SunIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const access_token = useAppSelector(getCurrentToken);
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    dispatch(setMode());
  };

  const signOut = () => {
    removeLocalToken();
    dispatch(logOut());
    toast.success("Logged Out Successfully");
  };

  const navItems = [
    { path: "/", label: "Home", icon: FaHome },
    { path: "/instruments", label: "Instruments", icon: FaChartLine },
    { path: "/accounts", label: "Accounts", icon: FaUserCircle },
    { path: "/about", label: "About", icon: FaInfoCircle },
    { path: "/contact", label: "Contact", icon: FaEnvelope },
  ];

  if (!access_token) return null;

  return (
    <nav className={`sticky top-0 z-30 w-full transition-all duration-300 ${isScrolled ? "bg-background/90 shadow-md backdrop-blur-lg" : "bg-background"}`}>
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src="/vite.svg" alt="Logo" className="w-8 h-8" />
          <span className="text-xl font-semibold tracking-tight">ICICI Breeze</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="items-center hidden space-x-4 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                location.pathname === item.path ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <item.icon className="w-4 h-4 mr-2" />
              {item.label}
            </Link>
          ))}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <SunIcon className="w-5 h-5 dark:hidden" />
            <MoonIcon className="hidden w-5 h-5 dark:block" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative w-8 h-8 p-0">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="https://ui-avatars.com/api/?name=Naveed+Khan" alt="Profile" />
                  <AvatarFallback>NK</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-medium">Naveed Khan</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut}>
                <FaSignOutAlt className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center space-x-2 md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <SunIcon className="w-5 h-5 dark:hidden" />
            <MoonIcon className="hidden w-5 h-5 dark:block" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <FaBars className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {navItems.map((item) => (
                <DropdownMenuItem asChild key={item.path}>
                  <Link to={item.path} className="flex items-center space-x-2">
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <FaSignOutAlt className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
