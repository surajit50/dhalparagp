"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { UserRole } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { ExtendedUser } from "../types/auth";
import { updateUser } from "@/action/userinfo";
import { ImageIcon } from "lucide-react";

const formSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  role: z.nativeEnum(UserRole),
  image: z.string().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface UserInfoDetailPageProps {
  user: ExtendedUser;
}

export default function UserInfoDetailPage({ user }: UserInfoDetailPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(
    user.image ?? null
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: user.id,
      name: user.name ?? "",
      email: user.email ?? "",
      role: user.role,
      image: user.image ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      const result = await updateUser({
        id: values.id,
        name: values.name,
        image: values.image,
        imageKey: undefined, // Will be handled by the upload process
      });

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      if (result.success) {
        toast({
          title: "Success",
          description: result.success,
        });
        setIsEditing(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setPreviewImage(result);
          form.setValue("image", result);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        toast({
          title: "Error",
          description: "Error processing image",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card className="w-full max-w-[600px] shadow-xl bg-white/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
          <Button
            onClick={() => setIsEditing((prev) => !prev)}
            variant="outline"
            size="sm"
            className="hover:bg-secondary"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>
        <Separator className="mt-4" />
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-primary/10">
                  {previewImage ? (
                    <AvatarImage
                      src={previewImage}
                      alt={user.name || "User avatar"}
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-muted">
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <AvatarFallback className="text-2xl">
                    {user.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <label htmlFor="imageUpload" className="cursor-pointer">
                      <span className="text-white text-sm">Change Image</span>
                    </label>
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="w-full max-w-xs">
                  <Input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {previewImage && (
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      Image selected
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        disabled={!isEditing}
                        className="bg-background/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        type="email"
                        disabled
                        className="bg-background/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Role</FormLabel>
                    <FormControl>
                      <Input {...field} disabled className="bg-background/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel className="text-sm font-medium">
                  2FA Authentication
                </FormLabel>
                <div className="h-10 flex items-center">
                  <Badge
                    variant={
                      user.isTwoFactorEnabled ? "default" : "destructive"
                    }
                    className="text-xs"
                  >
                    {user.isTwoFactorEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </FormItem>
            </div>

            {isEditing && (
              <div className="flex justify-end pt-4">
                <Button type="submit" className="px-6">
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
