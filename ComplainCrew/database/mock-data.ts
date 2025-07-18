import type { Complaint } from "../types/complaint-types"

export const mockComplaints: Complaint[] = [
  {
    id: "COMP001",
    customerId: "CUST001",
    customerEmail: "john.doe@example.com",
    title: "Scooter SC001 not starting",
    description: "Scooter SC001 at Station ST005 is not turning on. Display shows error code E-23.",
    type: "technical",
    priority: "high",
    status: "Open",
    createdAt: new Date("2023-10-26T10:00:00Z"),
    updatedAt: new Date("2023-10-26T10:00:00Z"),
    scooterId: "SC001",
    stationId: "ST005",
  },
  {
    id: "COMP002",
    customerId: "CUST002",
    customerEmail: "jane.smith@example.com",
    title: "Incorrect billing for ride",
    description: "I was charged $25 for a 10-minute ride, which is incorrect. Should be $5.",
    type: "billing",
    priority: "medium",
    status: "Open",
    createdAt: new Date("2023-10-25T14:30:00Z"),
    updatedAt: new Date("2023-10-25T14:30:00Z"),
  },
  {
    id: "COMP003",
    customerId: "CUST003",
    customerEmail: "bob.johnson@example.com",
    title: "Station ST010 always full",
    description: "Cannot return scooter to Station ST010, it's always at full capacity.",
    type: "service",
    priority: "medium",
    status: "Open",
    createdAt: new Date("2023-10-24T08:15:00Z"),
    updatedAt: new Date("2023-10-24T08:15:00Z"),
    stationId: "ST010",
  },
  {
    id: "COMP004",
    customerId: "CUST004",
    customerEmail: "alice.brown@example.com",
    title: "App crashing on startup",
    description: "The mobile app crashes immediately after opening on my Android device.",
    type: "technical",
    priority: "low",
    status: "Open",
    createdAt: new Date("2023-10-23T11:00:00Z"),
    updatedAt: new Date("2023-10-23T11:00:00Z"),
  },
  {
    id: "COMP005",
    customerId: "CUST005",
    customerEmail: "charlie.davis@example.com",
    title: "Lost item on scooter",
    description: "I left my keys on scooter SC015 yesterday. Can you help locate them?",
    type: "general",
    priority: "high",
    status: "Open",
    createdAt: new Date("2023-10-22T16:45:00Z"),
    updatedAt: new Date("2023-10-22T16:45:00Z"),
    scooterId: "SC015",
  },
]

export const getComplaintById = (id: string) => mockComplaints.find((c) => c.id === id)
