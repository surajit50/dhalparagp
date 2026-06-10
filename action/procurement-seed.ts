"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

const GP_CATEGORIES = [
  {
    name: "Vehicle & Machinery Hiring",
    icon: "🚜",
    color: "#3b82f6",
    description: "Hiring of JCB, Tractor, Dumper, Road Roller, etc.",
    fields: [
      { label: "Vehicle Type", name: "vehicle_type", type: "select", options: ["JCB", "Excavator", "Tractor", "Water Tanker", "Dumper", "Truck", "Road Roller"], required: true, order: 1 },
      { label: "Hiring Duration (Hours/Days)", name: "duration", type: "number", required: true, order: 2 },
      { label: "Work Location", name: "location", type: "text", required: true, order: 3 },
    ]
  },
  {
    name: "Material Supply",
    icon: "🧱",
    color: "#ef4444",
    description: "Supply of Bricks, Cement, Sand, Steel, etc.",
    fields: [
      { label: "Material Type", name: "material_type", type: "select", options: ["Cement", "Bricks", "Sand", "Stone Chips", "Rod/Steel", "Bitumen"], required: true, order: 1 },
      { label: "Quality/Grade", name: "quality", type: "text", required: false, order: 2 },
      { label: "Delivery Point", name: "delivery_point", type: "text", required: true, order: 3 },
    ]
  },
  {
    name: "Office Procurement",
    icon: "💻",
    color: "#8b5cf6",
    description: "Computers, Printers, CCTV, Furniture, etc.",
    fields: [
      { label: "Equipment Category", name: "equipment_cat", type: "select", options: ["Computer", "Laptop", "Printer", "CCTV", "Biometric", "UPS", "Inverter"], required: true, order: 1 },
      { label: "Warranty Required (Years)", name: "warranty", type: "number", required: false, order: 2 },
    ]
  },
  {
    name: "Event & Program Management",
    icon: "🎪",
    color: "#f59e0b",
    description: "Sound System, Stage, Tent, Catering for GP Events",
    fields: [
      { label: "Event Type", name: "event_type", type: "text", required: true, order: 1 },
      { label: "Service Details", name: "service_details", type: "textarea", required: true, order: 2 },
    ]
  }
]

export async function seedGPCategories() {
  try {
    for (const cat of GP_CATEGORIES) {
      const existing = await db.procurementCategory.findUnique({
        where: { name: cat.name }
      })

      if (!existing) {
        await db.procurementCategory.create({
          data: {
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            description: cat.description,
            fields: {
              create: cat.fields
            }
          }
        })
      }
    }
    revalidatePath("/admindashboard/manage-quotation/categories")
    return { success: true }
  } catch (error) {
    console.error("Error seeding categories:", error)
    return { success: false, error: "Failed to seed categories" }
  }
}
