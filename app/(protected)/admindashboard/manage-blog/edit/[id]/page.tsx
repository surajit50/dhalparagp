import { getBlogPostById } from "@/action/blog-actions";
import EditBlogForm from "./EditBlogForm";
import { notFound } from "next/navigation";

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getBlogPostById(id);

  if (result.error || !result.success) {
    return notFound();
  }

  const post = result.success;

  return (
    <div className="p-6">
      <EditBlogForm post={post} />
    </div>
  );
}
