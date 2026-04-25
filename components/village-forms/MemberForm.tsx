"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Mail,
  Phone,
  CreditCard,
  BookOpen,
  Briefcase,
  MapPin,
  Save,
  User,
  Fingerprint,
  Home,
  Flag,
} from "lucide-react";
import { memberSchema } from "@/schema/village-validation";
import { useEffect } from "react";
import { motion } from "framer-motion";

type MemberFormValues = z.infer<typeof memberSchema>;

interface MemberFormProps {
  onSubmit: (values: MemberFormValues) => Promise<void>;
  mouzas: any[];
  defaultValues?: Partial<MemberFormValues>;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export function MemberForm({
  onSubmit,
  mouzas,
  defaultValues,
  isSubmitting,
  isEditing = false,
}: MemberFormProps) {
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      salutation: "",
      firstName: "",
      lastName: "",
      dob: "",
      gender: "",
      religion: "",
      aadhar: "",
      email: "",
      contactNo: "",
      eduQualification: "",
      profession: "",
      address: "",
      village: "",
      pin: "",
      mouzaIds: [],
      politicalParty: "",
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  const inputStyle = "bg-white border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 rounded-xl h-12";
  const sectionStyle = "p-8 bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/50 space-y-8";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          {/* PERSONAL DETAILS SECTION */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg uppercase tracking-tight">
                Personal Identification
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="salutation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-wider">Salutation</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className={inputStyle}>
                          <SelectValue placeholder="Title" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Mr.">Mr.</SelectItem>
                        <SelectItem value="Mrs.">Mrs.</SelectItem>
                        <SelectItem value="Ms.">Ms.</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-wider">First Name</FormLabel>
                    <FormControl>
                      <Input {...field} className={inputStyle} placeholder="John" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} className={inputStyle} placeholder="Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className={inputStyle} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className={inputStyle}>
                          <SelectValue placeholder="Gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="religion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-wider">Religion</FormLabel>
                    <FormControl>
                      <Input {...field} className={inputStyle} placeholder="e.g. Hindu" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </motion.section>

          {/* IDENTIFICATION SECTION */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Fingerprint className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg uppercase tracking-tight">
                KYC & Communication
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="aadhar"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs font-bold text-gray-500 flex items-center gap-2 uppercase tracking-wider">
                      <CreditCard className="h-4 w-4 text-blue-400" />
                      Aadhar Document Number
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className={inputStyle} maxLength={12} placeholder="0000 0000 0000" />
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
                    <FormLabel className="text-xs font-bold text-gray-500 flex items-center gap-2 uppercase tracking-wider">
                      <Mail className="h-4 w-4 text-blue-400" />
                      Email Identity
                    </FormLabel>
                    <FormControl>
                      <Input type="email" {...field} className={inputStyle} placeholder="name@email.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-500 flex items-center gap-2 uppercase tracking-wider">
                      <Phone className="h-4 w-4 text-blue-400" />
                      Phone Connection
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className={inputStyle} placeholder="+91 0000000000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eduQualification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-500 flex items-center gap-2 uppercase tracking-wider">
                      <BookOpen className="h-4 w-4 text-blue-400" />
                      Academic Background
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className={inputStyle} placeholder="e.g. Graduate" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="profession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-500 flex items-center gap-2 uppercase tracking-wider">
                      <Briefcase className="h-4 w-4 text-blue-400" />
                      Current Profession
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className={inputStyle} placeholder="e.g. Farmer" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </motion.section>

          {/* ADDRESS SECTION */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Home className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg uppercase tracking-tight">
                Residential Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Residential Address</FormLabel>
                    <FormControl>
                      <Input {...field} className={inputStyle} placeholder="Street, House No, Locality" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="village"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-wider">Village</FormLabel>
                    <FormControl>
                      <Input {...field} className={inputStyle} placeholder="Village Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-500 flex items-center gap-2 uppercase tracking-wider">
                      <MapPin className="h-4 w-4 text-emerald-400" />
                      PIN Code
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className={inputStyle} maxLength={6} placeholder="700000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="politicalParty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-500 flex items-center gap-2 uppercase tracking-wider">
                      <Flag className="h-4 w-4 text-emerald-400" />
                      Political Party Affiliation
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={inputStyle}>
                          <SelectValue placeholder="Select Party" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="AITC">AITC</SelectItem>
                        <SelectItem value="BJP">BJP</SelectItem>
                        <SelectItem value="CPIM">CPIM</SelectItem>
                        <SelectItem value="INC">INC</SelectItem>
                        <SelectItem value="Independent">Independent</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-6">
              <FormField
                control={form.control}
                name="mouzaIds"
                render={() => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-xs font-bold text-gray-500 flex items-center gap-2 uppercase tracking-wider">
                      <MapPin className="h-4 w-4 text-emerald-400" />
                      Assigned Villages (Mouzas)
                    </FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50/50 p-6 rounded-2xl border border-dashed border-gray-200">
                      {mouzas.map((m) => (
                        <FormField
                          key={m.id}
                          control={form.control}
                          name="mouzaIds"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={m.id}
                                className="flex flex-row items-center space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(m.id)}
                                    onCheckedChange={(checked) => {
                                      let updated = field.value ? [...field.value] : [];
                                      if (checked) {
                                        updated.push(m.id);
                                      } else {
                                        updated = updated.filter((value: string) => value !== m.id);
                                      }
                                      field.onChange(updated);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-medium cursor-pointer text-sm text-gray-700">
                                  {m.name}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </motion.section>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          
        >
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-[250px] h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-purple-100 transition-all duration-200 active:scale-[0.98] text-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Save className="h-6 w-6" />
                <span>{isEditing ? "Update Profile" : "Create Profile"}</span>
              </div>
            )}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
}

