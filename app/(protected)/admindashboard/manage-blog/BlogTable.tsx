"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

import { deleteBlogPost } from "@/action/blog-actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function BlogTable({ initialPosts }: { initialPosts: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    startTransition(async () => {
      const res = await deleteBlogPost(deleteId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.success);
        router.refresh();
      }
      setDeleteId(null);
    });
  };

  return (
    <>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                  No blog posts found.
                </TableCell>
              </TableRow>
            ) : (
              initialPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    {post.imageUrl ? (
                      <div className="relative w-16 h-12 rounded overflow-hidden">
                        <Image src={post.imageUrl} alt={post.title} layout="fill" objectFit="cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No Img</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{format(new Date(post.createdAt), "PP")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admindashboard/manage-blog/edit/${post.id}`)}
                      >
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteId(post.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog post and remove its image from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isPending ? "Deleting..." : "Delete Post"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
