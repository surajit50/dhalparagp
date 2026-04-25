'use server';


import { db } from '@/lib/db';
import crypto from 'crypto';



export async function generateApiSecretKey() {
  // Generate a random 32-byte key
  const key = crypto.randomBytes(32).toString('hex');

  // Upsert: only one key in DB (singleton pattern)
  const apiKey = await db.apiSecretKey.upsert({
    where: { type: 'singleton' },
    update: { key },
    create: { type: 'singleton', key },
  });

  return apiKey.key;
}