"use client"

import * as React from "react"

export type SidebarContext = {
  expanded: boolean
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>
  state?: "expanded" | "collapsed"
  open?: boolean
  setOpen?: (open: boolean) => void
  isMobile?: boolean
  openMobile?: boolean
  setOpenMobile?: (open: boolean) => void
  toggleSidebar?: () => void
}

export const SidebarContext = React.createContext<SidebarContext>({
  expanded: true,
  setExpanded: () => {},
})
