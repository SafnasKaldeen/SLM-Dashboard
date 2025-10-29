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
  X,
  CheckCheck,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
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
import { createPortal } from "react-dom";

interface TaskNotification {
  QUERY_ID: string;
  TASK_NAME: string;
  SCHEDULED_TIME: string;
  START_TIME: string;
  END_TIME: string | null;
  STATUS: 'SUCCESS' | 'FAILED' | 'WARNING' | 'RUNNING' | 'PENDING';
  MESSAGE: string;
  IS_READ: boolean;
}

export function Header() {
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);
  
  // Notifications state
  const [notifications, setNotifications] = useState<TaskNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);

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

  // Fetch notifications
  useEffect(() => {
    if (isClient) {
      fetchNotifications();
      // Poll for new notifications every 24 hours (86400000 ms)
      const interval = setInterval(fetchNotifications, 24 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isClient]);

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    setNotificationsError(null);
    
    try {
      const sql = `
        SELECT 
          QUERY_ID,
          TASK_NAME,
          SCHEDULED_TIME,
          START_TIME,
          END_TIME,
          STATUS,
          MESSAGE,
          IS_READ
        FROM SOURCE_DATA.LOGS.TASK_EXECUTION_LOG
        ORDER BY START_TIME DESC
        LIMIT 50
      `;
      
      const response = await fetch('/api/snowflake/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }
      
      const data = await response.json();
      setNotifications(data);
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
      setNotificationsError(err.message);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markAsRead = async (queryId: string) => {
    try {
      const sql = `
        UPDATE SOURCE_DATA.LOGS.TASK_EXECUTION_LOG
        SET IS_READ = TRUE
        WHERE QUERY_ID = '${queryId}'
      `;
      
      await fetch('/api/snowflake/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql })
      });
      
      setNotifications((prev) =>
        prev.map((n) => (n.QUERY_ID === queryId ? { ...n, IS_READ: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const sql = `
        UPDATE SOURCE_DATA.LOGS.TASK_EXECUTION_LOG
        SET IS_READ = TRUE
        WHERE IS_READ = FALSE
      `;
      
      await fetch('/api/snowflake/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql })
      });
      
      setNotifications((prev) => prev.map((n) => ({ ...n, IS_READ: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const removeNotification = async (queryId: string) => {
    try {
      const sql = `
        DELETE FROM SOURCE_DATA.LOGS.TASK_EXECUTION_LOG
        WHERE QUERY_ID = '${queryId}'
      `;
      
      await fetch('/api/snowflake/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql })
      });
      
      setNotifications((prev) => prev.filter((n) => n.QUERY_ID !== queryId));
    } catch (error) {
      console.error('Failed to remove notification:', error);
    }
  };

  const clearAll = async () => {
    try {
      const sql = `TRUNCATE TABLE SOURCE_DATA.LOGS.TASK_EXECUTION_LOG`;
      
      await fetch('/api/snowflake/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql })
      });
      
      setNotifications([]);
    } catch (error) {
      console.error('Failed to clear all:', error);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case "SUCCESS":
        return {
          emoji: "✅",
          color: "from-green-500 to-emerald-400",
          borderColor: "border-green-400/40",
          textColor: "text-green-400",
          bgColor: "bg-green-500/10",
          shadowColor: "shadow-green-500/30",
          title: "TASK COMPLETED"
        };
      case "FAILED":
        return {
          emoji: "❌",
          color: "from-red-500 to-rose-400",
          borderColor: "border-red-400/40",
          textColor: "text-red-400",
          bgColor: "bg-red-500/10",
          shadowColor: "shadow-red-500/30",
          title: "TASK FAILED"
        };
      case "WARNING":
        return {
          emoji: "⚠️",
          color: "from-yellow-500 to-orange-400",
          borderColor: "border-yellow-400/40",
          textColor: "text-yellow-400",
          bgColor: "bg-yellow-500/10",
          shadowColor: "shadow-yellow-500/30",
          title: "TASK WARNING"
        };
      case "RUNNING":
        return {
          emoji: "⚡",
          color: "from-blue-500 to-cyan-400",
          borderColor: "border-blue-400/40",
          textColor: "text-blue-400",
          bgColor: "bg-blue-500/10",
          shadowColor: "shadow-blue-500/30",
          title: "TASK RUNNING"
        };
      case "PENDING":
        return {
          emoji: "⏳",
          color: "from-purple-500 to-pink-400",
          borderColor: "border-purple-400/40",
          textColor: "text-purple-400",
          bgColor: "bg-purple-500/10",
          shadowColor: "shadow-purple-500/30",
          title: "TASK PENDING"
        };
      default:
        return {
          emoji: "ℹ️",
          color: "from-gray-500 to-slate-400",
          borderColor: "border-gray-400/40",
          textColor: "text-gray-400",
          bgColor: "bg-gray-500/10",
          shadowColor: "shadow-gray-500/30",
          title: "TASK UPDATE"
        };
    }
  };

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return "Running...";
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatTime = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d.getTime())) return "Invalid Date";
      return d.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d.getTime())) return "Invalid Date";
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/auth/sign-in",
      redirect: true,
    });
  };

  const getUserInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const unreadCount = notifications.filter((n) => !n.IS_READ).length;

  return (
    <>
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
                    onClick={fetchNotifications}
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

          {/* Notifications Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative border-slate-700 bg-slate-900/50"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                >
                  <Bell className="h-4 w-4 text-slate-400" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-gradient-to-r from-blue-500 to-cyan-400 border-0 shadow-lg shadow-blue-500/50 animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Task Notifications</p>
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
            <div className="h-10 w-10 rounded-full bg-slate-700 animate-pulse" />
          ) : (
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

      {/* Notifications Panel */}
      {isClient && isNotificationsOpen && createPortal(
        <>
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] animate-fadeIn"
            onClick={() => setIsNotificationsOpen(false)}
          />

          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-4xl animate-systemAppear">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 blur-xl animate-pulse" />

                <div className="relative bg-gradient-to-b from-slate-900/95 to-black/95 border-2 border-blue-500/30 shadow-2xl shadow-blue-500/20 overflow-hidden">
                  <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-blue-400/50" />
                  <div className="absolute top-0 right-0 w-32 h-32 border-r-4 border-t-4 border-blue-400/50" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 border-l-4 border-b-4 border-blue-400/50" />
                  <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-blue-400/50" />

                  <div className="relative border-b-2 border-blue-500/30 bg-gradient-to-r from-slate-900/60 via-blue-900/20 to-slate-900/60 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
                          <Bell className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl sm:text-3xl font-black tracking-wider text-white uppercase system-font">
                            Task Execution Log
                          </h2>
                          <p className="text-blue-300 text-sm font-bold tracking-wide">
                            [ {unreadCount} UNREAD ALERTS • {notifications.length} TOTAL ]
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-slate-400 hover:text-white transition-colors duration-300 p-2 hover:bg-slate-800/50 rounded-lg"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {notifications.length > 0 && (
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={fetchNotifications}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-blue-500/30 hover:border-blue-400/50 text-blue-300 hover:text-blue-200 transition-all duration-300 font-bold text-sm tracking-wide uppercase"
                        >
                          <Clock className="w-4 h-4" />
                          Refresh
                        </button>
                        <button
                          onClick={markAllAsRead}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-blue-500/30 hover:border-blue-400/50 text-blue-300 hover:text-blue-200 transition-all duration-300 font-bold text-sm tracking-wide uppercase"
                        >
                          <CheckCheck className="w-4 h-4" />
                          Mark All Read
                        </button>
                        <button
                          onClick={clearAll}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-red-900/30 border border-blue-500/30 hover:border-red-500/50 text-blue-300 hover:text-red-300 transition-all duration-300 font-bold text-sm tracking-wide uppercase"
                        >
                          <Trash2 className="w-4 h-4" />
                          Clear All
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {notificationsLoading && notifications.length === 0 ? (
                      <div className="p-12 text-center">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-blue-400 animate-spin" />
                        <p className="text-blue-300 font-bold">Loading notifications...</p>
                      </div>
                    ) : notificationsError ? (
                      <div className="p-12 text-center">
                        <XCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                        <p className="text-red-300 font-bold mb-2">Failed to load notifications</p>
                        <p className="text-sm text-slate-400">{notificationsError}</p>
                        <button
                          onClick={fetchNotifications}
                          className="mt-4 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-blue-500/30 text-blue-300 transition-all duration-300 font-bold text-sm tracking-wide uppercase"
                        >
                          Retry
                        </button>
                      </div>
                    ) : notifications.length > 0 ? (
                      <div className="p-4 space-y-3">
                        {notifications.map((notification, index) => {
                          const config = getStatusConfig(notification.STATUS);
                          return (
                            <div
                              key={notification.QUERY_ID}
                              className={`relative group transition-all duration-300 ${
                                !notification.IS_READ ? "animate-slideIn" : "opacity-70 hover:opacity-100"
                              }`}
                              style={{ animationDelay: `${index * 0.05}s` }}
                            >
                              <div
                                className={`relative bg-gradient-to-r ${
                                  !notification.IS_READ
                                    ? `from-slate-800/80 to-slate-900/80 border-2 ${config.borderColor} ${config.shadowColor} shadow-lg`
                                    : "from-slate-800/40 to-slate-900/40 border-2 border-slate-700/40"
                                } p-4 transition-all duration-300 hover:border-blue-400/60 group-hover:shadow-lg group-hover:shadow-blue-500/20`}
                              >
                                <div className="absolute -left-2 -top-2 w-10 h-10">
                                  <div
                                    className={`w-full h-full bg-gradient-to-br ${config.color} rounded-full flex items-center justify-center text-xl shadow-lg ${config.shadowColor} ${
                                      notification.STATUS === 'RUNNING' ? 'animate-pulse' : ''
                                    }`}
                                  >
                                    {config.emoji}
                                  </div>
                                </div>

                                <div className="flex gap-4 ml-6">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                          <h4 className={`font-black text-base sm:text-lg uppercase tracking-wider system-font ${config.textColor}`}>
                                            {config.title}
                                          </h4>
                                          <span className={`px-2 py-1 rounded text-xs font-bold ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
                                            {notification.STATUS}
                                          </span>
                                        </div>
                                        <p className="text-white font-bold text-sm mb-2">
                                          {notification.TASK_NAME}
                                        </p>
                                        <p className="text-slate-300 text-sm font-medium leading-relaxed mb-3">
                                          {notification.MESSAGE}
                                        </p>
                                        
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                                          <div className="flex flex-col gap-1 p-2 bg-slate-800/30 rounded border border-slate-700/30">
                                            <span className="text-slate-500 font-bold uppercase tracking-wide">Scheduled</span>
                                            <span className="text-cyan-400 font-mono">{formatTime(notification.SCHEDULED_TIME)}</span>
                                            <span className="text-slate-400">{formatDate(notification.SCHEDULED_TIME)}</span>
                                          </div>
                                          <div className="flex flex-col gap-1 p-2 bg-slate-800/30 rounded border border-slate-700/30">
                                            <span className="text-slate-500 font-bold uppercase tracking-wide">Started</span>
                                            <span className="text-blue-400 font-mono">{formatTime(notification.START_TIME)}</span>
                                            <span className="text-slate-400">{formatDate(notification.START_TIME)}</span>
                                          </div>
                                          {notification.END_TIME && (
                                            <div className="flex flex-col gap-1 p-2 bg-slate-800/30 rounded border border-slate-700/30">
                                              <span className="text-slate-500 font-bold uppercase tracking-wide">Duration</span>
                                              <span className={`font-mono font-bold ${config.textColor}`}>
                                                {formatDuration(notification.START_TIME, notification.END_TIME)}
                                              </span>
                                              <span className="text-slate-400">{formatTime(notification.END_TIME)}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => removeNotification(notification.QUERY_ID)}
                                        className="text-slate-500 hover:text-red-400 transition-colors duration-300 p-1 hover:bg-slate-800/50 rounded"
                                      >
                                        <X className="w-5 h-5" />
                                      </button>
                                    </div>

                                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-700/50 flex-wrap">
                                      <span className="text-xs text-slate-500 font-mono">
                                        ID: {notification.QUERY_ID ? notification.QUERY_ID.slice(0, 12) : 'N/A'}...
                                      </span>
                                      {!notification.IS_READ && (
                                        <button
                                          onClick={() => markAsRead(notification.QUERY_ID)}
                                          className="ml-auto text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors duration-300 uppercase tracking-wide hover:underline"
                                        >
                                          → Mark as Read
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {!notification.IS_READ && (
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50 animate-pulse" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-12 text-center">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center border-2 border-blue-500/20">
                          <Bell className="w-12 h-12 text-slate-600" />
                        </div>
                        <p className="text-xl font-black text-slate-500 uppercase tracking-wider system-font">
                          No Task Logs Found
                        </p>
                        <p className="text-sm text-slate-600 mt-2 font-medium">
                          All notifications have been cleared
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t-2 border-blue-500/30 bg-gradient-to-r from-slate-900/60 via-blue-900/20 to-slate-900/60 p-4">
                    <div className="flex items-center justify-between text-xs text-blue-400 font-bold tracking-wider uppercase">
                      <span className="flex items-center gap-2">
                        <span>Snowflake Execution Monitor</span>
                        {notificationsLoading && <Clock className="w-3 h-3 animate-spin" />}
                      </span>
                      <span className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${notificationsError ? 'bg-red-400' : 'bg-blue-400 animate-pulse'}`} />
                        {notificationsError ? 'Error' : 'Online'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      <style jsx>{`
        .system-font {
          font-family: Impact, "Arial Black", sans-serif;
          text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes systemAppear {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-systemAppear {
          animation: systemAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-slideIn {
          animation: slideIn 0.4s ease-out forwards;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </>
  );
}