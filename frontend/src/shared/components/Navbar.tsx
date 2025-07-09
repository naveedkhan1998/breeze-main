'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toast } from 'sonner';
import {
  TrendingUp,
  User,
  Home,
  BarChart3,
  Info,
  Mail,
  Menu,
  Settings,
  LogOut,
  Search,
} from 'lucide-react';

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
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  getCurrentToken,
  getLoggedInUser,
  logOut,
} from 'src/features/auth/authSlice';
import { ModeToggle } from './ModeToggle';

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const access_token = useAppSelector(getCurrentToken);
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const user = useAppSelector(getLoggedInUser);

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
    {
      path: '/',
      label: 'Home',
      icon: Home,
      description: 'Overview & Analytics',
    },
    {
      path: '/instruments',
      label: 'Instruments',
      icon: BarChart3,
      description: 'Trading Instruments',
    },
    {
      path: '/accounts',
      label: 'Account',
      icon: TrendingUp,
      description: 'Account Management',
    },
    {
      path: '/about',
      label: 'About',
      icon: Info,
      description: 'Developer Information',
    },
    {
      path: '/contact',
      label: 'Support',
      icon: Mail,
      description: 'Help & Contact',
    },
  ];

  if (!access_token) return null;

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
          isScrolled
            ? 'bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/95 shadow-lg border-border/50'
            : 'bg-background/98 backdrop-blur-md border-border/30'
        }`}
      >
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo Section */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img
                  src="/android-chrome-192x192.png"
                  alt="Logo"
                  className="flex items-center justify-center w-10 h-10 transition-all duration-300 shadow-lg rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 group-hover:shadow-xl group-hover:scale-105"
                />

                <div className="absolute transition-opacity duration-300 opacity-0 -inset-1 bg-gradient-to-br from-primary/20 to-transparent rounded-xl group-hover:opacity-100 blur-sm" />
              </div>
              <div className="flex-col hidden sm:flex">
                <span className="text-xl font-bold tracking-tight text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text">
                  ICICI Breeze
                </span>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-0.5 font-medium"
                  >
                    Wrapper
                  </Badge>
                  {/* <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Live
                    </span>
                  </div> */}
                </div>
              </div>
            </Link>

            {/* Desktop Search Bar */}
            <div className="flex-1 hidden max-w-md mx-8 lg:flex">
              <div className="relative w-full">
                <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search instruments, symbols..."
                  value={searchQuery}
                  disabled={true}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="h-10 pl-10 pr-4 transition-all duration-200 bg-muted/50 border-border/50 focus:bg-background focus:border-primary/50"
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="items-center hidden space-x-1 lg:flex">
              <nav className="flex items-center space-x-1">
                {navItems.map(item => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg group ${
                        isActive
                          ? 'text-primary bg-primary/10 shadow-sm border border-primary/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                      }`}
                    >
                      <item.icon className="w-4 h-4 mr-2.5 transition-transform group-hover:scale-110" />
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <div className="absolute w-1 h-1 transform -translate-x-1/2 rounded-full -bottom-1 left-1/2 bg-primary" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              <Separator orientation="vertical" className="h-8 mx-4" />

              {/* Desktop Actions */}
              <div className="flex items-center space-x-2">
                {/* Notifications */}
                {/* <Button
                  variant="ghost"
                  size="icon"
                  className="relative w-10 h-10"
                >
                  <Bell className="w-4 h-4" />
                  <div className="absolute flex items-center justify-center w-3 h-3 rounded-full -top-1 -right-1 bg-destructive">
                    <span className="text-xs font-bold text-destructive-foreground">
                      3
                    </span>
                  </div>
                </Button> */}

                <ModeToggle />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 px-3 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-8 h-8 transition-all duration-200 hover:scale-105">
                          <AvatarImage
                            src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                            alt="Profile"
                          />
                          <AvatarFallback className="font-semibold bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                            {user?.name
                              ?.split(' ')
                              .map((n: string) => n[0])
                              .join('') || 'NK'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-col items-start hidden xl:flex">
                          <span className="text-sm font-medium">
                            {user?.name || 'Naveed Khan'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user?.is_admin ? 'Admin' : 'User'}
                          </span>
                        </div>
                      </div>
                      <div className="absolute w-3 h-3 border-2 rounded-full -bottom-1 -right-1 bg-success border-background" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="p-2 w-72">
                    <DropdownMenuLabel className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage
                            src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                            alt="Profile"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                            NK
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-semibold">{user?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user?.email || ''}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {user?.is_admin ? 'Admin' : 'User'}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {user?.auth_provider}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="p-3 cursor-pointer">
                      <Link to="/profile" className="flex items-center">
                        <User className="w-4 h-4 mr-3" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            Account Settings
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Manage your profile and preferences
                          </span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="p-3 cursor-pointer">
                      <Settings className="w-4 h-4 mr-3" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          Trading Settings
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Configure trading preferences
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={signOut}
                      className="p-3 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
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

            {/* Mobile Actions */}
            <div className="flex items-center space-x-2 lg:hidden">
              {/* <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="w-4 h-4" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full" />
              </Button> */}
              <ModeToggle />
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 overflow-auto w-80">
                  <SheetHeader className="p-6 pb-4 border-b">
                    <SheetTitle className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                          alt="Profile"
                        />
                        <AvatarFallback>NK</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="text-base font-semibold">
                          {user?.name || 'Naveed Khan'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {user?.email || ''}
                        </span>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {user?.is_admin ? 'Admin' : 'User'} Account
                        </Badge>
                      </div>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex flex-col h-full">
                    {/* Mobile Search */}
                    <div className="p-6 pb-4">
                      <div className="relative">
                        <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Search instruments..."
                          value={searchQuery}
                          disabled={true}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="flex-1 px-6">
                      <div className="space-y-2">
                        {navItems.map(item => {
                          const isActive = location.pathname === item.path;
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              className={`flex items-center px-4 py-3.5 text-base font-medium rounded-xl transition-all duration-200 ${
                                isActive
                                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                              }`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <item.icon className="w-5 h-5 mr-4" />
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {item.label}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {item.description}
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mobile Footer Actions */}
                    <div className="p-6 pt-4 space-y-3 border-t">
                      <Link
                        to="/profile"
                        className="flex items-center w-full px-4 py-3 text-sm font-medium transition-colors border rounded-xl hover:bg-accent/60"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        <div className="flex flex-col items-start">
                          <span>Account Settings</span>
                          <span className="text-xs text-muted-foreground">
                            Manage your profile
                          </span>
                        </div>
                      </Link>
                      <Button
                        variant="destructive"
                        className="justify-start w-full h-12"
                        onClick={() => {
                          signOut();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        <div className="flex flex-col items-start">
                          <span>Sign Out</span>
                          <span className="text-xs opacity-90">
                            End your session
                          </span>
                        </div>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
