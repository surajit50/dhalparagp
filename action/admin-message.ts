'use server'

import { revalidatePath } from 'next/cache'
import { db } from "@/lib/db"

export async function createMessage(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  try {
    const newMessage = await db.adminMessage.create({
      data: {
        title,
        content,
      },
    })

    revalidatePath('/admindashboard/master/addimpsmessage', 'page')
    return newMessage
  } catch (error) {
    console.error('Failed to create message:', error)
    throw new Error('Failed to create message')
  }
}

export async function getMessages() {
  try {
    const messages = await db.adminMessage.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    return messages
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    throw new Error('Failed to fetch messages')
  }
}

export async function deleteMessage(id: string) {
  try {
    await db.adminMessage.delete({
      where: {
        id,
      },
    })

    revalidatePath('/admindashboard/master/addimpsmessage', 'page')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete message:', error)
    throw new Error('Failed to delete message')
  }
}
