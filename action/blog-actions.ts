"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary"

export async function createBlogPost(data: {
  title: string
  content: string
  imageFile?: { name: string; type: string; data: string }
  excerpt?: string
}) {
  try {
    let imageUrl = "";
    let imageKey = "";

    if (data.imageFile) {
      const uploadResult = await uploadToCloudinary(data.imageFile, "blog_posts");
      if (uploadResult.success && uploadResult.data) {
        imageUrl = uploadResult.data.url;
        imageKey = uploadResult.data.public_id;
      } else {
        return { error: uploadResult.error || "Failed to upload image to Cloudinary" };
      }
    }

    const newPost = await db.blogPost.create({
      data: {
        title: data.title,
        content: data.content,
        imageUrl: imageUrl || null,
        imageKey: imageKey || null,
        excerpt: data.excerpt,
      },
    })

    revalidatePath("/")

    return { success: "Blog post created successfully!", post: newPost }
  } catch (error) {
    console.error("Failed to create blog post:", error)
    return { error: "Failed to create blog post" }
  }
}

export async function getRecentBlogPosts(limit = 4) {
  try {
    const posts = await db.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
    return { success: posts }
  } catch (error) {
    console.error("Failed to fetch blog posts:", error)
    return { error: "Failed to fetch blog posts" }
  }
}

export async function getAllBlogPosts() {
  try {
    const posts = await db.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    })
    return { success: posts }
  } catch (error) {
    console.error("Failed to fetch all blog posts:", error)
    return { error: "Failed to fetch all blog posts" }
  }
}

export async function getBlogPostById(id: string) {
  try {
    const post = await db.blogPost.findUnique({
      where: { id },
    })
    if (!post) {
      return { error: "Blog post not found" }
    }
    return { success: post }
  } catch (error) {
    console.error("Failed to fetch blog post:", error)
    return { error: "Failed to fetch blog post" }
  }
}

export async function updateBlogPost(id: string, data: {
  title: string
  content: string
  imageFile?: { name: string; type: string; data: string } | null
  excerpt?: string
}) {
  try {
    const existingPost = await db.blogPost.findUnique({ where: { id } })
    if (!existingPost) {
      return { error: "Blog post not found" }
    }

    let imageUrl = existingPost.imageUrl;
    let imageKey = existingPost.imageKey;

    if (data.imageFile) {
      // Upload new image
      const uploadResult = await uploadToCloudinary(data.imageFile, "blog_posts");
      if (uploadResult.success && uploadResult.data) {
        imageUrl = uploadResult.data.url;
        imageKey = uploadResult.data.public_id;

        // Delete old image if it exists
        if (existingPost.imageKey) {
           await deleteFromCloudinary(existingPost.imageKey);
        }
      } else {
        return { error: uploadResult.error || "Failed to upload new image to Cloudinary" };
      }
    }

    const updatedPost = await db.blogPost.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        imageUrl,
        imageKey,
        excerpt: data.excerpt,
      },
    })
    
    revalidatePath("/")
    revalidatePath(`/manage-blog`)
    revalidatePath(`/manage-blog/edit/${id}`)
    
    return { success: "Blog post updated successfully!", post: updatedPost }
  } catch (error) {
    console.error("Failed to update blog post:", error)
    return { error: "Failed to update blog post" }
  }
}

export async function deleteBlogPost(id: string) {
  try {
    const existingPost = await db.blogPost.findUnique({ where: { id } })
    if (!existingPost) {
      return { error: "Blog post not found" }
    }

    if (existingPost.imageKey) {
      await deleteFromCloudinary(existingPost.imageKey);
    }

    await db.blogPost.delete({ where: { id } })
    
    revalidatePath("/")
    revalidatePath(`/manage-blog`)

    return { success: "Blog post deleted successfully!" }
  } catch (error) {
    console.error("Failed to delete blog post:", error)
    return { error: "Failed to delete blog post" }
  }
}
