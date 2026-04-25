'use client'

import React, { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  id: z.string(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  role: z.string().min(1, {
    message: "Role is required.",
  }),
  image: z.string().optional(),
})

interface ExtendedUser extends z.infer<typeof formSchema> {
  isTwoFactorEnabled: boolean
}

interface UserInfoDetailPageProps {
  user?: ExtendedUser
}

export default function UserInfoDetailPage({ user }: UserInfoDetailPageProps = {}) {
  const [isEditing, setIsEditing] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(user?.image || null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: user || {
      id: "",
      name: "",
      email: "",
      role: "",
      image: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // TODO: Implement API call to update user data
    console.log(values)
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    })
    setIsEditing(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
        form.setValue("image", reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (!user) {
    return <div className="text-center p-4">No user data available</div>
  }

  return (
    <Card className="w-full max-w-[550px] shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">User Profile</CardTitle>
        <div className="flex justify-end">
          <Button
            onClick={() => setIsEditing((prev) => !prev)}
            variant="outline"
          >
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-center">
              <Avatar className="w-24 h-24">
                <AvatarImage
                  src={previewImage || ""}
                  alt={form.getValues("name") || "User avatar"}
                />
                <AvatarFallback>{form.getValues("name")?.[0] || "U"}</AvatarFallback>
              </Avatar>
            </div>

            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!isEditing} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" disabled={!isEditing} />
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
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing && (
              <FormItem>
                <FormLabel>Profile Image</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full"
                  />
                </FormControl>
              </FormItem>
            )}

            <div className="flex justify-between items-center">
              <FormLabel>2FA Authentication</FormLabel>
              <Badge variant={user.isTwoFactorEnabled ? "default" : "destructive"}>
                {user.isTwoFactorEnabled ? "ON" : "OFF"}
              </Badge>
            </div>

            {isEditing && (
              <div className="flex justify-end">
                <Button type="submit">Save Changes</Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
