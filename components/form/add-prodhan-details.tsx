"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { saveGPProfile } from '@/action/gp-profile';
import { useToast } from "@/components/ui/use-toast";
// Form validation schema
const formSchema = z.object({
  gpname: z.string().min(2, "Name must be at least 2 characters"),
  gpaddress: z.string().min(5, "Address must be at least 5 characters"),
  nameinprodhan: z.string().min(2, "Prodhan name must be at least 2 characters"),
  gpcode: z.string().min(2, "GP code must be at least 2 characters"),
  gpnameinshort: z.string().min(2, "Short name must be at least 2 characters"),
  blockname: z.string().min(2, "Block name must be at least 2 characters"),
  gpshortname: z.string().min(2, "Short name must be at least 2 characters"),
})

export function ProdhanForm() {
  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gpname: "",
      gpaddress: "",
      nameinprodhan: "",
      gpcode: "",
      gpnameinshort: "",
      blockname: "",
      gpshortname: ""
    },
  })

  // Form submit handler
  // Add this import at the top of your component file


// Update the submit handler in your component
async function onSubmit(values: z.infer<typeof formSchema>) {
  const result = await saveGPProfile(values);
  
}

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <FormField
          control={form.control}
          name="gpname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GP Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter GP full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="gpaddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GP Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter full address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="nameinprodhan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name in Prodhan</FormLabel>
              <FormControl>
                <Input placeholder="Enter name as in Prodhan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="gpcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GP Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter GP code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="blockname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Block Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter block name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="gpnameinshort"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Short Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter short name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="gpshortname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GP Short Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter GP short name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" className="w-full md:w-auto">
          Save GP Profile
        </Button>
      </form>
    </Form>
  )
}
