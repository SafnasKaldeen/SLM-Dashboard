import { NavItem } from "@/lib/types";
import {
  LayoutDashboard,
  Banknote,
  BookCopy,
  UserRoundCog,
  LogOut,
} from "lucide-react";

export const SIDEBAR_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    key: "dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard className="sidebar-icon" />,
  },
  {
    title: "History",
    key: "history",
    path: "/history",
    icon: <BookCopy className="sidebar-icon" />,
  },
  {
    title: "Subscription",
    key: "subscription",
    path: "/subscription",
    icon: <Banknote className="sidebar-icon" />,
  },
  // {
  //   title: "Profile",
  //   key: "profile",
  //   path: "/profile",
  //   icon: <UserRoundCog className="h-7 w-7" />,
  // },
  {
    title: "Sign Out",
    key: "signout",
    path: "#",
    icon: <LogOut className="sidebar-icon" />,
  },
];
