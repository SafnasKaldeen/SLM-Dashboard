"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Moon, Sun, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  // Add a state to track if we're on the client
  const [isClient, setIsClient] = useState(false);
  // Use a state to store the theme icon to render
  const [themeIcon, setThemeIcon] = useState<"dark" | "light">("dark");

  // Set isClient to true once component mounts on client
  useEffect(() => {
    setIsClient(true);
    // Update theme icon based on actual theme
    setThemeIcon((theme as "dark" | "light") || "dark");
  }, [theme]);

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
            {/* Only render time when on client */}
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="border-slate-700 bg-slate-900/50"
            >
              {/* Only render theme-sensitive content client-side */}
              {isClient ? (
                theme === "dark" ? (
                  <Moon className="h-4 w-4 text-slate-400" />
                ) : (
                  <Sun className="h-4 w-4 text-slate-400" />
                )
              ) : (
                // Default to Moon icon on server
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
      </div>
    </header>
  );
}
