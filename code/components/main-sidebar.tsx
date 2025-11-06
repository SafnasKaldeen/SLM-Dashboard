"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SIDEBAR as Sidebar,
  SIDEBARContent as SidebarContent,
  SIDEBARHeader as SidebarHeader,
  SIDEBARFooter as SidebarFooter,
  SIDEBARGroup as SidebarGroup,
  SIDEBARGroupContent as SidebarGroupContent,
  SIDEBARGroupLabel as SidebarGroupLabel,
  SIDEBARMenu as SidebarMenu,
  SIDEBARMenuItem as SidebarMenuItem,
  SIDEBARMenuButton as SidebarMenuButton,
  SIDEBARSeparator as SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  Home,
  MapPin,
  Battery,
  Zap,
  BarChart3,
  AlertTriangle,
  Route,
  Layers,
  Navigation,
  Gauge,
  Activity,
  Calendar,
  Users,
  Settings,
  BatteryCharging,
  Cpu,
  LineChart,
  PieChart,
  Hexagon,
  Wrench,
  DollarSign,
  TrendingUp,
  BrainCog,
  Target,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

export function MainSidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    dashboard: true,
    gps: pathname?.startsWith("/gps") || false,
    battery: pathname?.startsWith("/battery") || false,
    motor: pathname?.startsWith("/motor") || false,
    analytics: pathname?.startsWith("/analytics") || false,
    fleet: pathname?.startsWith("/fleet") || false,
    charging: pathname?.startsWith("/charging") || false,
    revenue: pathname?.startsWith("/revenue") || false,
  });

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const isActive = (path: string) => pathname === path;

  // Define category icons with their colors for consistency
  const categoryIcons = {
    fleet: { icon: <Users className="h-4 w-4" />, color: "text-blue-500" },
    gps: { icon: <MapPin className="h-4 w-4" />, color: "text-cyan-500" },
    battery: { icon: <Battery className="h-4 w-4" />, color: "text-green-500" },
    motor: { icon: <Zap className="h-4 w-4" />, color: "text-amber-500" },
    charging: {
      icon: <BatteryCharging className="h-4 w-4" />,
      color: "text-purple-500",
    },
    revenue: {
      icon: <DollarSign className="h-4 w-4" />,
      color: "text-emerald-500",
    },
    analytics: {
      icon: <BarChart3 className="h-4 w-4" />,
      color: "text-blue-500",
    },
  };

  // Define menu categories and their items for consistency
  const menuCategories = [
    {
      id: "fleet",
      label: "Fleet Management",
      icon: categoryIcons.fleet,
      items: [
        {
          path: "/fleet",
          label: "Overview",
          icon: <Activity className="h-4 w-4" />,
        },
        {
          path: "/fleet/vehicles",
          label: "Vehicles",
          icon: <Hexagon className="h-4 w-4" />,
        },
        {
          path: "/fleet/maintenance",
          label: "Maintenance",
          icon: <Wrench className="h-4 w-4" />,
        },
        {
          path: "/fleet/schedule",
          label: "Schedule",
          icon: <Calendar className="h-4 w-4" />,
        },
      ],
    },
    {
      id: "gps",
      label: "GPS Services",
      icon: categoryIcons.gps,
      items: [
        {
          path: "/gps",
          label: "Overview",
          icon: <Layers className="h-4 w-4" />,
        },
        {
          path: "/gps/route-planning",
          label: "Route Planning",
          icon: <Route className="h-4 w-4" />,
        },
        {
          path: "/gps/station-allocation",
          label: "Station Allocation",
          icon: <Layers className="h-4 w-4" />,
        },
        {
          path: "/gps/closest-stations",
          label: "Closest Stations",
          icon: <Navigation className="h-4 w-4" />,
        },
      ],
    },
    {
      id: "battery",
      label: "Battery Services",
      icon: categoryIcons.battery,
      items: [
        {
          path: "/battery",
          label: "Overview",
          icon: <Activity className="h-4 w-4" />,
        },
        {
          path: "/battery/health",
          label: "Health Monitoring",
          icon: <Gauge className="h-4 w-4" />,
        },
        {
          path: "/battery/performance",
          label: "Performance",
          icon: <LineChart className="h-4 w-4" />,
        },
        {
          path: "/battery/prediction",
          label: "Prediction",
          icon: <PieChart className="h-4 w-4" />,
        },
      ],
    },
    {
      id: "motor",
      label: "Motor Services",
      icon: categoryIcons.motor,
      items: [
        {
          path: "/motor",
          label: "Overview",
          icon: <Activity className="h-4 w-4" />,
        },
        {
          path: "/motor/diagnostics",
          label: "Diagnostics",
          icon: <Cpu className="h-4 w-4" />,
        },
        {
          path: "/motor/efficiency",
          label: "Efficiency",
          icon: <Gauge className="h-4 w-4" />,
        },
        {
          path: "/motor/maintenance",
          label: "Maintenance",
          icon: <Wrench className="h-4 w-4" />,
        },
      ],
    },
    {
      id: "charging",
      label: "Charging Stations",
      icon: categoryIcons.charging,
      items: [
        {
          path: "/charging",
          label: "Overview",
          icon: <Activity className="h-4 w-4" />,
        },
        {
          path: "/charging/stations",
          label: "Station Map",
          icon: <MapPin className="h-4 w-4" />,
        },
        {
          path: "/charging/usage",
          label: "Usage Analytics",
          icon: <BarChart3 className="h-4 w-4" />,
        },
        {
          path: "/charging/scheduling",
          label: "Scheduling",
          icon: <Calendar className="h-4 w-4" />,
        },
      ],
    },
    {
      id: "revenue",
      label: "Revenue Management",
      icon: {
        icon: <DollarSign className="h-4 w-4" />,
        color: "text-emerald-500",
      },
      items: [
        {
          path: "/revenue",
          label: "Overview",
          icon: <Activity className="h-4 w-4" />,
        },
        {
          path: "/revenue/analytics",
          label: "Analytics",
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          path: "/revenue/adhoc",
          label: "Adhoc",
          icon: <BrainCog className="h-4 w-4" />,
        },
        {
          path: "/revenue/forecasting",
          label: "Forecasting",
          icon: <Target className="h-4 w-4" />,
        },
      ],
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: categoryIcons.analytics,
      items: [
        {
          path: "/analytics",
          label: "Dashboard",
          icon: <Activity className="h-4 w-4" />,
        },
        {
          path: "/analytics/reports",
          label: "Reports",
          icon: <LineChart className="h-4 w-4" />,
        },
        {
          path: "/analytics/predictions",
          label: "Predictions",
          icon: <PieChart className="h-4 w-4" />,
        },
        {
          path: "/analytics/alerts",
          label: "Alerts",
          icon: <AlertTriangle className="h-4 w-4" />,
        },
      ],
    },
  ];

  return (
    <Sidebar className="border-r border-slate-800 bg-slate-900 w-64">
      <SidebarHeader className="p-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Hexagon className="h-8 w-8 text-cyan-500" />
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            SL-MOBILITY
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2">
        {/* Dashboard */}
        <SidebarGroup className="px-2 py-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/")}
                className="w-full px-3 py-2 rounded-md transition-colors hover:bg-slate-800"
              >
                <Link href="/" className="flex items-center space-x-3">
                  <div className="flex items-center justify-center h-6 w-6 rounded-md bg-blue-500/10 text-blue-500">
                    <Home className="h-4 w-4" />
                  </div>
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="my-2 bg-slate-800" />

        {/* Menu Categories */}
        {menuCategories.map((category) => (
          <Collapsible
            key={category.id}
            open={openGroups[category.id]}
            onOpenChange={() => toggleGroup(category.id)}
            className="group relative px-2 py-1"
          >
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center px-3 py-2 rounded-md transition-colors hover:bg-slate-800 cursor-pointer">
                  <div className="flex flex-1 items-center">
                    <div
                      className={`flex items-center justify-center h-6 w-6 rounded-md ${category.icon.color.replace(
                        "text-",
                        "bg-"
                      )}/10 ${category.icon.color} mr-3`}
                    >
                      {category.icon.icon}
                    </div>
                    <span className="font-medium">{category.label}</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 ${
                      category.icon.color
                    } transition-transform duration-200 ease-in-out ${
                      openGroups[category.id] ? "rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>
              </SidebarGroupLabel>

              <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown">
                <SidebarGroupContent>
                  <SidebarMenu className="pl-9 mt-1 space-y-1">
                    {category.items.map((item) => (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.path)}
                          className={`w-full px-3 py-2 rounded-md transition-colors ${
                            isActive(item.path)
                              ? `bg-${
                                  category.icon.color.split("-")[1]
                                }-500/10 ${category.icon.color}`
                              : "hover:bg-slate-800 text-slate-300"
                          }`}
                        >
                          <Link
                            href={item.path}
                            className="flex items-center space-x-3"
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}

        <SidebarSeparator className="my-2 bg-slate-800" />

        {/* Settings */}
        <SidebarGroup className="px-2 py-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/settings")}
                className="w-full px-3 py-2 rounded-md transition-colors hover:bg-slate-800"
              >
                <Link href="/settings" className="flex items-center space-x-3">
                  <div className="flex items-center justify-center h-6 w-6 rounded-md bg-slate-500/10 text-slate-500">
                    <Settings className="h-4 w-4" />
                  </div>
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3">
          <Avatar className="h-9 w-9 border border-slate-700">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
            <AvatarFallback className="bg-slate-800 text-cyan-500">
              SK
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Safnas Kaldeen</span>
            <span className="text-xs text-slate-400">Data Analyst</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

// Add these styles to your globals.css or a component-specific CSS file
/*
@keyframes slideDown {
  from {
    height: 0;
  }
  to {
    height: var(--radix-collapsible-content-height);
  }
}

@keyframes slideUp {
  from {
    height: var(--radix-collapsible-content-height);
  }
  to {
    height: 0;
  }
}

.animate-slideDown {
  animation: slideDown 300ms ease-out;
}

.animate-slideUp {
  animation: slideUp 300ms ease-out;
}
*/
