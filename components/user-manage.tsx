"use client";

import {
  toggleTwoFactor,
  updateUserRole,
  UserRole,
  createUser,
  resetUserPassword,
} from "@/action/userinfo";
import { Designation } from "@prisma/client";
import { useState, useTransition, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreateUserSchema } from "@/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ShieldCheck,
  ShieldX,
  Users,
  User,
  UserCog,
  Shield,
  KeyRound,
  UserPlus,
  Search,
  Ghost,
  RotateCcw,
} from "lucide-react";

type UserType = {
  id: string;
  name: string | null;
  email: string | null;
  isTwoFactorEnabled: boolean;
  role: UserRole;
  designation: Designation | null;
  slno: number;
  avatar: string;
};

type Props = {
  initialUsers: UserType[];
  currentUserRole: string; // Used to determine which tabs/roles to show
};

export default function UserManagementClient({
  initialUsers,
  currentUserRole,
}: Props) {
  const [users, setUsers] = useState<UserType[]>(initialUsers);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Determine available tabs and creation roles based on current user
  const availableRoles =
    currentUserRole === "superadmin"
      ? ["user", "staff", "admin", "superadmin", "agency", "citizen"]
      : currentUserRole === "admin"
        ? ["user", "staff", "agency", "citizen"] // Admins now see user, staff, agency, and citizen
        : ["user", "citizen"];

  const form = useForm<z.infer<typeof CreateUserSchema>>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
      mobileNumber: "",
    },
  });

  const onSubmit = (values: z.infer<typeof CreateUserSchema>) => {
    startTransition(async () => {
      const result = await createUser(values);

      if (result.success) {
        toast({ title: "Success", description: result.success });
        setIsDialogOpen(false);
        form.reset();

        if (result.user) {
          const newUser: UserType = {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            isTwoFactorEnabled: result.user.isTwoFactorEnabled,
            role: result.user.role as UserRole,
            designation: result.user.designation as Designation | null,
            slno: users.length + 1,
            avatar: result.user.image || "/placeholder.svg?height=40&width=40",
          };
          setUsers((prev) => [...prev, newUser]);
        }
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  const [resettingUsers, setResettingUsers] = useState<Set<string>>(new Set());

  const currentFilteredUsers = users.filter((user) => {
    const matchesRole = user.role === selectedRole;
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const currentUserIds = currentFilteredUsers.map((user) => user.id);

  const allSelected =
    currentUserIds.length > 0 &&
    currentUserIds.every((id) => selectedUsers.includes(id));

  useEffect(() => {
    setSelectedUsers([]);
    setSearchQuery("");
  }, [selectedRole]);

  const handleSelectAll = () => {
    setSelectedUsers(allSelected ? [] : currentUserIds);
  };

  const handleSelectUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id],
    );
  };

  const handleToggle2FA = async (enable: boolean) => {
    if (selectedUsers.length === 0) {
      toast({ title: "Warning", description: "Select at least one user" });
      return;
    }

    startTransition(async () => {
      const result = await toggleTwoFactor(selectedUsers, enable);

      if (result.success) {
        setUsers((prev) =>
          prev.map((u) =>
            selectedUsers.includes(u.id)
              ? { ...u, isTwoFactorEnabled: enable }
              : u,
          ),
        );
        setSelectedUsers([]);
        toast({ title: "Success", description: result.message });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    startTransition(async () => {
      const result = await updateUserRole(userId, role);

      if (result.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role } : u)),
        );
        toast({ title: "Role Updated", description: result.message });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  const handleSendPasswordReset = async (user: UserType) => {
    if (!user.email) {
      toast({
        title: "Error",
        description: "User email not available",
        variant: "destructive",
      });
      return;
    }

    setResettingUsers((prev) => new Set(prev).add(user.id));

    try {
      await fetch("/api/send-reset-password", {
        method: "POST",
        body: JSON.stringify({ email: user.email }),
      });
      toast({
        title: "Reset Link Sent",
        description: "Password reset email sent successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to send reset link",
        variant: "destructive",
      });
    }

    setResettingUsers((prev) => {
      const set = new Set(prev);
      set.delete(user.id);
      return set;
    });
  };

  const handleResetPassword = async (userId: string) => {
    startTransition(async () => {
      const result = await resetUserPassword(userId);
      if (result.success) {
        toast({
          title: "Password Reset Successful",
          description:
            "The user's password has been reset to the default: Test@123",
          variant: "default",
        });
      } else {
        toast({
          title: "Reset Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your team members, roles, and security settings.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm">
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Fill in the details below to invite a new member to the
                platform.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 mt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
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
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="john@example.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <Input placeholder="1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="••••••••"
                            type="password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={(v) => {
                            field.onChange(v);
                            if (v !== "staff") {
                              form.setValue("designation", undefined);
                            }
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {/* Dynamically hide creation roles based on user permissions */}
                            {availableRoles.includes("user") && (
                              <SelectItem value="user">User</SelectItem>
                            )}
                            {availableRoles.includes("staff") && (
                              <SelectItem value="staff">Staff</SelectItem>
                            )}
                            {availableRoles.includes("admin") && (
                              <SelectItem value="admin">Admin</SelectItem>
                            )}
                            {availableRoles.includes("superadmin") && (
                              <SelectItem value="superadmin">
                                Super Admin
                              </SelectItem>
                            )}
                            {availableRoles.includes("agency") && (
                              <SelectItem value="agency">Agency</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("role") === "staff" && (
                    <FormField
                      control={form.control}
                      name="designation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Designation</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select designation" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(Designation).map((d) => (
                                <SelectItem key={d} value={d}>
                                  {d.replace(/_/g, " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <DialogFooter className="pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Creating..." : "Create User"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs
        value={selectedRole}
        onValueChange={(v) => setSelectedRole(v as UserRole)}
        className="w-full"
      >
        <ScrollArea className="w-full whitespace-nowrap pb-2">
          <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full sm:w-auto">
            {/* Conditional Tab Rendering */}
            {availableRoles.includes("user") && (
              <TabsTrigger value="user" className="min-w-[100px]">
                <User className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
            )}
            {availableRoles.includes("staff") && (
              <TabsTrigger value="staff" className="min-w-[100px]">
                <Users className="h-4 w-4 mr-2" />
                Staff
              </TabsTrigger>
            )}
            {availableRoles.includes("admin") && (
              <TabsTrigger value="admin" className="min-w-[100px]">
                <UserCog className="h-4 w-4 mr-2" />
                Admin
              </TabsTrigger>
            )}
            {availableRoles.includes("superadmin") && (
              <TabsTrigger value="superadmin" className="min-w-[120px]">
                <Shield className="h-4 w-4 mr-2" />
                Super Admin
              </TabsTrigger>
            )}
            {availableRoles.includes("agency") && (
              <TabsTrigger value="agency" className="min-w-[100px]">
                <ShieldCheck className="h-4 w-4 mr-2" />
                Agency
              </TabsTrigger>
            )}
            {availableRoles.includes("citizen") && (
              <TabsTrigger value="citizen" className="min-w-[100px]">
                <User className="h-4 w-4 mr-2" />
                Citizen
              </TabsTrigger>
            )}
          </TabsList>
        </ScrollArea>

        {availableRoles.map((role) => (
          <TabsContent
            key={role}
            value={role}
            className="mt-4 focus-visible:outline-none"
          >
            <Card className="shadow-sm border-muted">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/20 border-b">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      className="pl-8 w-full sm:w-[250px] bg-background"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleToggle2FA(true)}
                    disabled={selectedUsers.length === 0 || isPending}
                    className="gap-2 w-full sm:w-auto"
                  >
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                    Enable 2FA
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggle2FA(false)}
                    disabled={selectedUsers.length === 0 || isPending}
                    className="gap-2 w-full sm:w-auto"
                  >
                    <ShieldX className="h-4 w-4 text-destructive" />
                    Disable 2FA
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {currentFilteredUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <Ghost className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold">No users found</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mt-1">
                      {searchQuery
                        ? `We couldn't find anyone matching "${searchQuery}".`
                        : `There are currently no users assigned to the ${role} role.`}
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px] rounded-b-lg">
                    <Table>
                      <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
                        <TableRow>
                          <TableHead className="w-[50px]">
                            <Checkbox
                              checked={allSelected}
                              onCheckedChange={handleSelectAll}
                              aria-label="Select all"
                            />
                          </TableHead>
                          <TableHead className="w-[80px]">S.No</TableHead>
                          <TableHead>User Profile</TableHead>
                          <TableHead>Designation</TableHead>
                          <TableHead>Security</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="text-right pr-6">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {currentFilteredUsers.map((user, index) => (
                          <TableRow
                            key={user.id}
                            className="group hover:bg-muted/30 transition-colors"
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedUsers.includes(user.id)}
                                onCheckedChange={() =>
                                  handleSelectUser(user.id)
                                }
                                aria-label={`Select ${user.name}`}
                              />
                            </TableCell>

                            <TableCell className="text-muted-foreground">
                              {index + 1}
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border">
                                  <AvatarImage
                                    src={user.avatar || "/avatar.png"}
                                  />
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {user.name?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="font-medium text-sm">
                                    {user.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {user.email}
                                  </span>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              {user.designation ? (
                                <Badge
                                  variant="secondary"
                                  className="font-normal"
                                >
                                  {user.designation.replace(/_/g, " ")}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-xs italic">
                                  N/A
                                </span>
                              )}
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-2">
                                {user.isTwoFactorEnabled ? (
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300 border-transparent font-normal">
                                    2FA Enabled
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-muted-foreground font-normal"
                                  >
                                    Disabled
                                  </Badge>
                                )}
                              </div>
                            </TableCell>

                            <TableCell>
                              {currentUserRole === "superadmin" ? (
                                <Select
                                  value={user.role}
                                  onValueChange={(v: UserRole) =>
                                    handleRoleChange(user.id, v)
                                  }
                                >
                                  <SelectTrigger className="w-[130px] h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="staff">Staff</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="superadmin">
                                      Super Admin
                                    </SelectItem>
                                    <SelectItem value="agency">
                                      Agency
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="uppercase text-[10px] tracking-wider"
                                >
                                  {user.role}
                                </Badge>
                              )}
                            </TableCell>

                            <TableCell className="text-right pr-6">
                              <div className="flex justify-end gap-2">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 hover:bg-muted"
                                      disabled={isPending}
                                      title="Reset Password to Default (Test@123)"
                                    >
                                      <RotateCcw
                                        className={`h-4 w-4 text-orange-600 ${isPending ? "animate-spin" : ""}`}
                                      />
                                      <span className="sr-only">
                                        Reset to Default
                                      </span>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Reset Password?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will reset the user&apos;s password
                                        to the default:{" "}
                                        <span className="font-bold text-primary">
                                          Test@123
                                        </span>
                                        .
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleResetPassword(user.id)
                                        }
                                        className="bg-orange-600 hover:bg-orange-700"
                                      >
                                        Confirm Reset
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover:bg-muted"
                                  onClick={() => handleSendPasswordReset(user)}
                                  disabled={
                                    !user.email || resettingUsers.has(user.id)
                                  }
                                  title="Send Password Reset Link"
                                >
                                  <KeyRound
                                    className={`h-4 w-4 text-muted-foreground ${
                                      resettingUsers.has(user.id)
                                        ? "animate-spin"
                                        : ""
                                    }`}
                                  />
                                  <span className="sr-only">
                                    Send Reset Link
                                  </span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
