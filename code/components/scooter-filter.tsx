"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar"

// Mock data - replace with your actual data
const scooters = [
  { id: "SCT-001", name: "Scooter 001" },
  { id: "SCT-002", name: "Scooter 002" },
  { id: "SCT-003", name: "Scooter 003" },
  { id: "SCT-004", name: "Scooter 004" },
  { id: "SCT-005", name: "Scooter 005" },
]

const bmsIds = [
  { id: "BMS-001", name: "BMS 001" },
  { id: "BMS-002", name: "BMS 002" },
  { id: "BMS-003", name: "BMS 003" },
]

interface ScooterFilterProps {
  onScooterSelect: (id: string | null) => void
  onBmsSelect: (id: string | null) => void
  selectedScooter: string | null
  selectedBmsId: string | null
}

export default function ScooterFilter({
  onScooterSelect,
  onBmsSelect,
  selectedScooter,
  selectedBmsId,
}: ScooterFilterProps) {
  const [openScooter, setOpenScooter] = useState(false)
  const [openBms, setOpenBms] = useState(false)

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Filters</SidebarGroupLabel>
      <SidebarGroupContent className="space-y-2">
        <div className="space-y-1">
          <label className="text-xs font-medium">Scooter</label>
          <Popover open={openScooter} onOpenChange={setOpenScooter}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={openScooter} className="w-full justify-between">
                {selectedScooter
                  ? scooters.find((scooter) => scooter.id === selectedScooter)?.name
                  : "Select scooter..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search scooter..." />
                <CommandList>
                  <CommandEmpty>No scooter found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        onScooterSelect(null)
                        setOpenScooter(false)
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", !selectedScooter ? "opacity-100" : "opacity-0")} />
                      All Scooters
                    </CommandItem>
                    {scooters.map((scooter) => (
                      <CommandItem
                        key={scooter.id}
                        onSelect={() => {
                          onScooterSelect(scooter.id)
                          setOpenScooter(false)
                        }}
                      >
                        <Check
                          className={cn("mr-2 h-4 w-4", selectedScooter === scooter.id ? "opacity-100" : "opacity-0")}
                        />
                        {scooter.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium">BMS ID</label>
          <Popover open={openBms} onOpenChange={setOpenBms}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={openBms} className="w-full justify-between">
                {selectedBmsId ? bmsIds.find((bms) => bms.id === selectedBmsId)?.name : "Select BMS ID..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search BMS ID..." />
                <CommandList>
                  <CommandEmpty>No BMS ID found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        onBmsSelect(null)
                        setOpenBms(false)
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", !selectedBmsId ? "opacity-100" : "opacity-0")} />
                      All BMS IDs
                    </CommandItem>
                    {bmsIds.map((bms) => (
                      <CommandItem
                        key={bms.id}
                        onSelect={() => {
                          onBmsSelect(bms.id)
                          setOpenBms(false)
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", selectedBmsId === bms.id ? "opacity-100" : "opacity-0")} />
                        {bms.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
