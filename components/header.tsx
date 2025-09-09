"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Search,
  Moon,
  Sun,
  Download,
  RefreshCw,
  User,
  LogOut,
  Settings,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true once component mounts on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/auth/sign-in", // redirect to sign-in page
      redirect: true, // ensure cookie is cleared and page reloads
    });
  };

  // Get user initials for avatar fallback
  const getUserInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-20 border-b border-slate-800 bg-black/20 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search..."
            className="pl-10 w-64 bg-slate-900/50 border-slate-700 focus-visible:ring-cyan-500"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="hidden md:flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm font-mono text-cyan-400">
              {isClient ? formatTime(currentTime) : "00:00:00"}
            </div>
            <div className="text-xs text-slate-400">
              {isClient ? formatDate(currentTime) : "Loading..."}
            </div>
          </div>

          <div className="h-8 border-r border-slate-700"></div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-slate-700 bg-slate-900/50"
                >
                  <RefreshCw className="h-4 w-4 text-slate-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh Data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-slate-700 bg-slate-900/50"
                >
                  <Download className="h-4 w-4 text-slate-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export Data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Notifications */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative border-slate-700 bg-slate-900/50"
              >
                <Bell className="h-4 w-4 text-slate-400" />
                <Badge className="absolute -top-1 -right-1 h-2 w-2 p-0 bg-cyan-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Theme Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="border-slate-700 bg-slate-900/50"
            >
              {isClient ? (
                theme === "dark" ? (
                  <Moon className="h-4 w-4 text-slate-400" />
                ) : (
                  <Sun className="h-4 w-4 text-slate-400" />
                )
              ) : (
                <Moon className="h-4 w-4 text-slate-400" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Dropdown */}
        {isClient && status === "authenticated" && session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={session.user.image || undefined}
                    alt={session.user.name || "User"}
                  />
                  <AvatarFallback className="bg-slate-700 text-slate-200">
                    {getUserInitials(session.user.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session.user.name || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Shield className="mr-2 h-4 w-4" />
                <span>Security</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : status === "loading" ? (
          // Loading state
          <div className="h-10 w-10 rounded-full bg-slate-700 animate-pulse" />
        ) : (
          // Not authenticated - show sign in button
          <Button
            variant="outline"
            className="border-slate-700 bg-slate-900/50"
            onClick={() => (window.location.href = "/auth/signin")}
          >
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}
