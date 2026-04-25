"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  createMessage,
  getMessages,
  deleteMessage,
} from "@/action/admin-message";

type Message = {
  id: string;
  title: string;
  content: string;
  bgColor: string;
  textColor: string;
  createdAt: Date;
  updatedAt: Date;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: Array<{ field: string; message: string }>;
};

type ValidationError = {
  field: string;
  message: string;
};

export default function AdminMessageCenter() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const colorOptions = {
    backgrounds: [
      { value: "bg-slate-700", label: "Slate" },
      { value: "bg-emerald-600", label: "Emerald" },
      { value: "bg-indigo-600", label: "Indigo" },
      { value: "bg-rose-600", label: "Rose" },
      { value: "bg-amber-600", label: "Amber" },
      { value: "bg-cyan-600", label: "Cyan" },
      { value: "bg-violet-600", label: "Violet" },
      { value: "bg-teal-600", label: "Teal" },
    ],
    text: [
      { value: "text-white", label: "White" },
      { value: "text-slate-100", label: "Light Slate" },
      { value: "text-amber-100", label: "Light Amber" },
      { value: "text-emerald-100", label: "Light Emerald" },
      { value: "text-cyan-100", label: "Light Cyan" },
      { value: "text-rose-100", label: "Light Rose" },
      { value: "text-violet-100", label: "Light Violet" },
      { value: "text-indigo-100", label: "Light Indigo" },
    ],
  };

  // Predefined color combinations that work well together
  const colorCombinations = [
    { bg: "bg-slate-700", text: "text-white" },
    { bg: "bg-emerald-600", text: "text-white" },
    { bg: "bg-indigo-600", text: "text-indigo-100" },
    { bg: "bg-rose-600", text: "text-rose-100" },
    { bg: "bg-amber-600", text: "text-amber-100" },
    { bg: "bg-cyan-600", text: "text-cyan-100" },
    { bg: "bg-violet-600", text: "text-violet-100" },
    { bg: "bg-teal-600", text: "text-teal-100" },
  ];

  // Function to get a random color combination
  const getRandomColorCombination = () => {
    const randomIndex = Math.floor(Math.random() * colorCombinations.length);
    return colorCombinations[randomIndex];
  };

  // Function to get the next color combination
  const getNextColorCombination = (currentBg: string) => {
    const currentIndex = colorCombinations.findIndex(
      (combo) => combo.bg === currentBg
    );
    const nextIndex = (currentIndex + 1) % colorCombinations.length;
    return colorCombinations[nextIndex];
  };

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const response = (await getMessages()) as unknown as ApiResponse<
          Message[]
        >;
        if (response.success && response.data) {
          setMessages(response.data);
        } else {
          toast({
            title: "Error",
            description:
              response.error || "Failed to load messages. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [toast]);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setValidationErrors([]);

    try {
      const response = (await createMessage(
        formData
      )) as unknown as ApiResponse<Message>;
      if (response.success && response.data) {
        setMessages((prevMessages) => [response.data!, ...prevMessages]);
        toast({
          title: "Message Created",
          description: "Your message has been successfully created and sent.",
        });
        router.refresh();
        formRef.current?.reset();
      } else {
        if (response.details) {
          setValidationErrors(response.details);
          toast({
            title: "Validation Error",
            description: "Please check the form for errors.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description:
              response.error || "Failed to create message. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Failed to create message:", error);
      toast({
        title: "Error",
        description: "Failed to create message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      const response = (await deleteMessage(id)) as ApiResponse<null>;
      if (response.success) {
        setMessages(messages.filter((message) => message.id !== id));
        toast({
          title: "Message Deleted",
          description: "The message has been successfully deleted.",
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description:
            response.error || "Failed to delete message. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (fieldName: string) => {
    return validationErrors.find((error) => error.field === fieldName)?.message;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Message Center</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create New Message</CardTitle>
            <CardDescription>
              Compose a new message to send to users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter message title"
                  required
                  minLength={3}
                  maxLength={100}
                  className={`w-full ${
                    getFieldError("title") ? "border-red-500" : ""
                  }`}
                />
                {getFieldError("title") && (
                  <p className="text-sm text-red-500">
                    {getFieldError("title")}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Enter message content"
                  required
                  minLength={10}
                  maxLength={500}
                  className={`w-full min-h-[150px] ${
                    getFieldError("content") ? "border-red-500" : ""
                  }`}
                />
                {getFieldError("content") && (
                  <p className="text-sm text-red-500">
                    {getFieldError("content")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bgColor">Background Color</Label>
                  <select
                    id="bgColor"
                    name="bgColor"
                    className={`w-full p-2 border rounded-md ${
                      getFieldError("bgColor") ? "border-red-500" : ""
                    }`}
                    defaultValue="bg-slate-700"
                  >
                    {colorOptions.backgrounds.map((color) => (
                      <option key={color.value} value={color.value}>
                        {color.label}
                      </option>
                    ))}
                  </select>
                  {getFieldError("bgColor") && (
                    <p className="text-sm text-red-500">
                      {getFieldError("bgColor")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="textColor">Text Color</Label>
                  <select
                    id="textColor"
                    name="textColor"
                    className={`w-full p-2 border rounded-md ${
                      getFieldError("textColor") ? "border-red-500" : ""
                    }`}
                    defaultValue="text-white"
                  >
                    {colorOptions.text.map((color) => (
                      <option key={color.value} value={color.value}>
                        {color.label}
                      </option>
                    ))}
                  </select>
                  {getFieldError("textColor") && (
                    <p className="text-sm text-red-500">
                      {getFieldError("textColor")}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    formRef.current?.reset();
                    setValidationErrors([]);
                  }}
                  disabled={isLoading}
                >
                  Clear Form
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Message History</CardTitle>
            <CardDescription>View and manage existing messages</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center">Loading messages...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell>{message.title}</TableCell>
                      <TableCell>
                        {message.createdAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{message.title}</DialogTitle>
                                <DialogDescription>
                                  Sent on{" "}
                                  {message.createdAt.toLocaleDateString()}
                                </DialogDescription>
                              </DialogHeader>
                              <p className="mt-4">{message.content}</p>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(message.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
