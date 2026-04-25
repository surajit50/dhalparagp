"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Trash2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  upsertScheme,
  getScheme,
  type SchemeActionState,
} from "@/action/upload-govt-scheme";
import { useFormState } from "react-dom";
import { Label } from "@/components/ui/label";

const icons = {
  Users,
  Trash2,
  Home,
};

const initialState: SchemeActionState = {
  message: null,
};

export default function SchemeUploadForm({
  schemeId = "",
}: {
  schemeId?: string;
}) {
  const [state, formAction] = useFormState(upsertScheme, initialState);
  const [icon, setIcon] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (schemeId) {
      setIsLoading(true);
      getScheme(schemeId)
        .then((scheme) => {
          if (scheme) {
            setTitle(scheme.title);
            setDescription(scheme.description);
            setIcon(scheme.icon);
          }
        })
        .catch((error) => {
          console.error("Error fetching scheme:", error);
          // You might want to show an error message to the user here
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [schemeId]);

  const handleSubmit = async (formData: FormData) => {
    formData.append("id", schemeId);
    formData.append("icon", icon);
    const result = await formAction(formData);

    router.push("/admindashboard/master/govt-scheme/view");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{schemeId ? "Edit" : "Upload"} Government Scheme</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Select value={icon} onValueChange={setIcon} required>
              <SelectTrigger id="icon">
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(icons).map(([iconName, Icon]) => (
                  <SelectItem key={iconName} value={iconName}>
                    <div className="flex items-center">
                      <Icon className="mr-2 h-4 w-4" />
                      {iconName}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            {schemeId ? "Update" : "Upload"} Scheme
          </Button>
          {state.message && (
            <p
              className={`mt-2 text-sm ${
                state.error ? "text-red-500" : "text-green-500"
              }`}
            >
              {state.message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
