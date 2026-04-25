"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

// Message actions (unchanged)

export async function updateMessage(id: string, content: string) {
  const updatedMessage = await db.adminMessage.update({
    where: { id },
    data: { content },
  });
  revalidatePath("/admin/messages", 'page');
  return updatedMessage;
}

export async function deleteMessage(id: string) {
  await db.adminMessage.delete({ where: { id } });
  revalidatePath("/admin/messages", 'page');
}

export async function getMessages() {
  return db.adminMessage.findMany();
}

// Blog post actions (unchanged)
export async function createBlogPost(data: {
  title: string;
  excerpt: string;
  content: string;
}) {
  const newBlogPost = await db.blogPost.create({ data });
  revalidatePath("/admin/blog-posts", 'page');
  return newBlogPost;
}

export async function updateBlogPost(
  id: string,
  data: { title: string; excerpt: string; content: string }
) {
  const updatedBlogPost = await db.blogPost.update({ where: { id }, data });
  revalidatePath("/admin/blog-posts", 'page');
  return updatedBlogPost;
}

export async function deleteBlogPost(id: string) {
  await db.blogPost.delete({ where: { id } });
  revalidatePath("/admin/blog-posts", 'page');
}

export async function getBlogPosts() {
  return db.blogPost.findMany();
}

// Government scheme actions
export async function createGovernmentScheme(data: {
  title: string;
  description: string;
  icon: string;
}) {
  const newScheme = await db.governmentScheme.create({ data });
  revalidatePath("/admin/government-schemes", 'page');
  return newScheme;
}

export async function updateGovernmentScheme(
  id: string,
  data: { title: string; description: string; icon: string }
) {
  const updatedScheme = await db.governmentScheme.update({
    where: { id },
    data,
  });
  revalidatePath("/admin/government-schemes", 'page');
  return updatedScheme;
}

export async function deleteGovernmentScheme(id: string) {
  await db.governmentScheme.delete({ where: { id } });
  revalidatePath("/admin/government-schemes", 'page');
}

export async function getGovernmentSchemes() {
  return db.governmentScheme.findMany();
}

// We'll add actions for UsefulLink later
