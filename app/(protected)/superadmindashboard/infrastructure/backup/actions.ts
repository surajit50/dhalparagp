'use server'

import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"

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
          backupData[modelName] = await dbDelegate.findMany();
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
