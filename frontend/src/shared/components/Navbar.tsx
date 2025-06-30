import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toast } from 'sonner';
import {
  FaSignOutAlt,
  FaUserCircle,
  FaHome,
  FaChartLine,
  FaInfoCircle,
  FaEnvelope,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getCurrentToken, logOut } from 'src/features/auth/authSlice';
import { ModeToggle } from './ModeToggle';

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const access_token = useAppSelector(getCurrentToken);
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const signOut = () => {
    dispatch(logOut());
    toast.success('Logged Out Successfully');
  };

  const navItems = [
    { path: '/', label: 'Home', icon: FaHome },
    { path: '/instruments', label: 'Instruments', icon: FaChartLine },
    { path: '/accounts', label: 'Accounts', icon: FaUserCircle },
    { path: '/about', label: 'About', icon: FaInfoCircle },
    { path: '/contact', label: 'Contact', icon: FaEnvelope },
  ];

  if (!access_token) return null;

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
          isScrolled
            ? 'bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm'
            : 'bg-background/95 backdrop-blur-sm'
        }`}
      >
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img
                  src="/android-chrome-192x192.png"
                  alt="Logo"
                  className="transition-transform rounded-lg w-9 h-9 group-hover:scale-105"
                />
                <div className="absolute inset-0 transition-opacity rounded-lg opacity-0 bg-gradient-to-br from-primary/20 to-transparent group-hover:opacity-100" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text">
                  ICICI Breeze
                </span>
                <Badge variant="secondary" className="text-xs w-fit">
                  Trading Platform
                </Badge>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-8">
              <nav className="flex items-center space-x-1">
                {navItems.map(item => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg group ${
                        isActive
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                      }`}
                    >
                      <item.icon className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                      {item.label}
                      {isActive && (
                        <div className="absolute bottom-0 w-1 h-1 transform -translate-x-1/2 rounded-full left-1/2 bg-primary" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center space-x-3">
                <ModeToggle />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative w-10 h-10 p-0 rounded-full"
                    >
                      <Avatar className="w-10 h-10 transition-all duration-200 hover:scale-105 hover:ring-2 hover:ring-primary/20">
                        <AvatarImage
                          src="https://ui-avatars.com/api/?name=Naveed+Khan&background=random"
                          alt="Profile"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                          NK
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute w-3 h-3 bg-green-500 border-2 rounded-full -bottom-1 -right-1 border-background" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2">
                    <DropdownMenuLabel className="p-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage
                            src="https://ui-avatars.com/api/?name=Naveed+Khan&background=random"
                            alt="Profile"
                          />
                          <AvatarFallback>NK</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-semibold">Naveed Khan</p>
                          <p className="text-xs text-muted-foreground">
                            admin@icici.com
                          </p>
                          <Badge variant="outline" className="text-xs w-fit">
                            Premium
                          </Badge>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="p-3 cursor-pointer">
                      <Link to="/profile" className="flex items-center">
                        <FaUserCircle className="w-4 h-4 mr-3" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            Profile Settings
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Manage your account
                          </span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={signOut}
                      className="p-3 text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                    >
                      <FaSignOutAlt className="w-4 h-4 mr-3" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Sign Out</span>
                        <span className="text-xs text-muted-foreground">
                          End your session
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-2 lg:hidden">
              <ModeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <div className="relative w-5 h-5">
                  <FaBars
                    className={`absolute inset-0 w-5 h-5 transition-all duration-200 ${
                      isMobileMenuOpen
                        ? 'opacity-0 rotate-45'
                        : 'opacity-100 rotate-0'
                    }`}
                  />
                  <FaTimes
                    className={`absolute inset-0 w-5 h-5 transition-all duration-200 ${
                      isMobileMenuOpen
                        ? 'opacity-100 rotate-0'
                        : 'opacity-0 -rotate-45'
                    }`}
                  />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-16 left-0 right-0 z-50 bg-background border-b shadow-lg lg:hidden transition-all duration-300 ${
          isMobileMenuOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
      >
        <div className="container px-4 py-6 mx-auto">
          <div className="space-y-2">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="flex items-center px-4 space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src="https://ui-avatars.com/api/?name=Naveed+Khan&background=random"
                  alt="Profile"
                />
                <AvatarFallback>NK</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-semibold">Naveed Khan</p>
                <p className="text-xs text-muted-foreground">admin@icici.com</p>
              </div>
            </div>

            <Link
              to="/profile"
              className="flex items-center w-full px-4 py-2 text-sm font-medium transition-colors border rounded-lg hover:bg-accent/50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaUserCircle className="w-4 h-4 mr-3" />
              Profile Settings
            </Link>

            <Button
              variant="destructive"
              className="justify-start w-full"
              onClick={() => {
                signOut();
                setIsMobileMenuOpen(false);
              }}
            >
              <FaSignOutAlt className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
