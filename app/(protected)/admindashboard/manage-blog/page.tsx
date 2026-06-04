import { getAllBlogPosts } from "@/action/blog-actions";
import BlogTable from "./BlogTable";

export default async function ManageBlogPage() {
  const result = await getAllBlogPosts();
  const posts = result.success || [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Blog Posts</h1>
      </div>
      <BlogTable initialPosts={posts} />
    </div>
  );
}
