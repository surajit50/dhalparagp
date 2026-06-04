"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { ImagePlus, Pencil, Eye } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { updateBlogPost } from "@/action/blog-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
  content: z.string().min(10, "Content must be at least 10 characters long"),
  image: z.any().optional(),
});

export default function EditBlogForm({ post }: { post: any }) {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(post.imageUrl || null);
  const [activeTab, setActiveTab] = useState("edit");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post.title,
      content: post.content,
    },
  });

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: { onChange: (value: any) => void }
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      field.onChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      try {
        let imageFile = undefined;

        if (values.image) {
           const file = values.image as File;
           const reader = new FileReader();
           const base64Data = await new Promise<string>((resolve) => {
             reader.onloadend = () => resolve(reader.result as string);
             reader.readAsDataURL(file);
           });
           imageFile = {
             name: file.name,
             type: file.type,
             data: base64Data
           };
        }

        const excerpt = values.content.substring(0, 100) + (values.content.length > 100 ? "..." : "");

        const res = await updateBlogPost(post.id, {
          title: values.title,
          content: values.content,
          imageFile,
          excerpt,
        });

        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(res.success);
          router.push('/admindashboard/manage-blog');
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
      }
    });
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader className="bg-primary text-primary-foreground">
        <CardTitle className="text-2xl font-bold">
          Edit Blog Post
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter an engaging title"
                      className="text-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">
                    Cover Image
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-4">
                      <Input
                        type="file"
                        onChange={(e) => handleImageChange(e, field)}
                        accept="image/*"
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className={cn(
                          "flex items-center justify-center w-40 h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors overflow-hidden relative",
                          imagePreview
                            ? "border-primary"
                            : "border-gray-300 hover:border-gray-400"
                        )}
                      >
                        {imagePreview ? (
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            layout="fill"
                            objectFit="cover"
                          />
                        ) : (
                          <ImagePlus className="w-12 h-12 text-gray-400" />
                        )}
                      </label>
                      {field.value && field.value.name ? (
                        <p className="text-sm text-gray-500">
                          {field.value.name} (
                          {Math.round(field.value.size / 1024)} KB)
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Click to change the existing photo
                        </p>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">
                    Content
                  </FormLabel>
                  <Tabs
                    defaultValue="edit"
                    className="w-full"
                    onValueChange={setActiveTab}
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="edit" className="flex items-center">
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </TabsTrigger>
                      <TabsTrigger
                        value="preview"
                        className="flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit">
                      <FormControl>
                        <Textarea
                          placeholder="Write your blog content here"
                          className="min-h-[300px] text-base"
                          {...field}
                        />
                      </FormControl>
                    </TabsContent>
                    <TabsContent value="preview">
                      <div className="min-h-[300px] p-4 border rounded-md prose max-w-none bg-white">
                        {field.value ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: field.value.replace(/\n/g, "<br>"),
                            }}
                          />
                        ) : (
                          <p className="text-gray-400">No content to preview</p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                  <FormMessage />
                </FormItem>
              )}
            />
            <CardFooter className="px-0 flex justify-end gap-2">
              <Button type="button" variant="outline" size="lg" onClick={() => router.push('/admindashboard/manage-blog')}>
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
