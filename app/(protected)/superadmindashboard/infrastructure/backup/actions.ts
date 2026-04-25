'use server'

import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"

function transformToEJSON(data: any): any {
  if (data === null || data === undefined) return data;

  if (data instanceof Date) {
    return { "$date": data.toISOString() };
  }

  if (Array.isArray(data)) {
    return data.map(transformToEJSON);
  }

  if (typeof data === 'object') {
    // If it's already a Date object
    if (Object.prototype.toString.call(data) === '[object Date]') {
      return { "$date": (data as Date).toISOString() };
    }

    const transformed: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Handle MongoDB ObjectId
      // Prisma returns ObjectIds as strings. We want to wrap them in $oid
      if ((key === 'id' || key === '_id' || key.endsWith('Id')) && 
          typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value)) {
        transformed[key] = { "$oid": value };
      } else {
        transformed[key] = transformToEJSON(value);
      }
    }
    return transformed;
  }

  return data;
}

export async function getBackupData() {
  try {
    const backupData: Record<string, any> = {};
    const models = Prisma.dmmf.datamodel.models;

    for (const model of models) {
      const modelName = model.name;
      // Convert first letter to lowercase for Prisma client accessor
      const delegateName = modelName.charAt(0).toLowerCase() + modelName.slice(1);
      
      const dbDelegate = (db as any)[delegateName];
      if (dbDelegate && typeof dbDelegate.findMany === 'function') {
        try {
          const rawData = await dbDelegate.findMany();
          backupData[modelName] = transformToEJSON(rawData);
        } catch (err) {
          console.warn(`Failed to backup ${modelName}`, err);
        }
      }
    }

    const backup = {
      timestamp: new Date().toISOString(),
      data: backupData
    };
    
    return { success: true, data: backup };
  } catch (error) {
    console.error('Backup failed:', error)
    return { success: false, error: 'Failed to create backup' }
  }
}
