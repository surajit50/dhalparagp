"use server"

import { db } from "@/lib/db"

export async function processAiProcurement(prompt: string) {
  try {
    const categories = await db.procurementCategory.findMany({
      include: { fields: true }
    })

    const input = prompt.toLowerCase()
    let result: any = {
      categoryId: "",
      workName: "",
      items: [],
      estimatedAmount: 0,
      dynamicData: {}
    }

    // 1. Identify Category and extract data based on GP specific keywords
    
    // Vehicle Hiring Pattern
    if (input.includes("hire") || input.includes("jcb") || input.includes("tractor") || input.includes("hiring")) {
      const cat = categories.find(c => c.name.toLowerCase().includes("vehicle"))
      if (cat) {
        result.categoryId = cat.id
        
        // Extract vehicle type
        const vehicles = ["jcb", "excavator", "tractor", "dumper", "truck", "roller"]
        const foundVehicle = vehicles.find(v => input.includes(v))
        if (foundVehicle) {
          result.dynamicData.vehicle_type = foundVehicle.toUpperCase()
          
          // Extract duration
          const durationMatch = input.match(/(\d+)\s+(hours?|days?)/)
          if (durationMatch) {
            result.dynamicData.duration = parseInt(durationMatch[1])
            result.workName = `Hiring of ${foundVehicle.toUpperCase()} for ${durationMatch[1]} ${durationMatch[2]}`
            result.items.push({ 
              description: `${foundVehicle.toUpperCase()} Hiring`, 
              quantity: parseInt(durationMatch[1]), 
              unit: durationMatch[2].startsWith("hour") ? "Hours" : "Days" 
            })
          }
        }
      }
    }
    
    // Material Supply Pattern
    else if (input.includes("supply") || input.includes("purchase") || input.includes("cement") || input.includes("bricks") || input.includes("bags")) {
      const cat = categories.find(c => c.name.toLowerCase().includes("material"))
      if (cat) {
        result.categoryId = cat.id
        
        const materials = [
          { name: "cement", unit: "Bags" },
          { name: "bricks", unit: "Nos" },
          { name: "sand", unit: "Cum" },
          { name: "steel", unit: "Kg" },
          { name: "rod", unit: "Kg" }
        ]
        
        const foundMaterial = materials.find(m => input.includes(m.name))
        if (foundMaterial) {
          result.dynamicData.material_type = foundMaterial.name.charAt(0).toUpperCase() + foundMaterial.name.slice(1)
          
          const qtyMatch = input.match(/(\d+)\s*(bags|nos|pcs|cum|kg)?/)
          if (qtyMatch) {
            const qty = parseInt(qtyMatch[1])
            const unit = qtyMatch[2] ? (qtyMatch[2].charAt(0).toUpperCase() + qtyMatch[2].slice(1)) : foundMaterial.unit
            
            result.workName = `Supply of ${qty} ${unit} ${foundMaterial.name.toUpperCase()}`
            result.items.push({ 
              description: foundMaterial.name.toUpperCase(), 
              quantity: qty, 
              unit: unit 
            })
          }
        }
      }
    }
    
    // Office Equipment Pattern
    else if (input.includes("computer") || input.includes("printer") || input.includes("cctv") || input.includes("laptop")) {
      const cat = categories.find(c => c.name.toLowerCase().includes("office"))
      if (cat) {
        result.categoryId = cat.id
        
        const equipment = ["computer", "printer", "cctv", "laptop", "ups", "biometric"]
        const foundEquip = equipment.find(e => input.includes(e))
        
        if (foundEquip) {
          result.dynamicData.equipment_cat = foundEquip.charAt(0).toUpperCase() + foundEquip.slice(1)
          
          const qtyMatch = input.match(/(\d+)\s*(nos|pcs|units)?/)
          const qty = qtyMatch ? parseInt(qtyMatch[1]) : 1
          
          result.workName = `Procurement of ${qty} ${foundEquip.toUpperCase()}(s)`
          result.items.push({ 
            description: foundEquip.toUpperCase(), 
            quantity: qty, 
            unit: "Nos" 
          })
        }
      }
    }

    // Event Management Pattern
    else if (input.includes("event") || input.includes("program") || input.includes("sound") || input.includes("tent") || input.includes("stage")) {
      const cat = categories.find(c => c.name.toLowerCase().includes("event"))
      if (cat) {
        result.categoryId = cat.id
        result.workName = "Management of GP Event/Program"
        result.dynamicData.event_type = "GP Awareness/Cultural Program"
        result.items.push({ description: "Event Services", quantity: 1, unit: "Lump Sum" })
      }
    }

    if (result.categoryId) {
      return { success: true, data: result }
    }

    return { success: false, error: "I couldn't identify the specific Gram Panchayat procurement category. Please try mentioning keywords like 'JCB', 'Cement', 'Computer', or 'Sound System'." }

  } catch (error) {
    console.error("AI Processing Error:", error)
    return { success: false, error: "AI processing failed" }
  }
}
