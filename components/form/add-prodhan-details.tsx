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
import { Textarea } from "@/components/ui/textarea"
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
  prodhanMessage: z.string().optional(),
})

interface ProdhanFormProps {
  initialData?: z.infer<typeof formSchema> | null;
}

export function ProdhanForm({ initialData }: ProdhanFormProps) {
  const { toast } = useToast()
  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gpname: initialData?.gpname || "",
      gpaddress: initialData?.gpaddress || "",
      nameinprodhan: initialData?.nameinprodhan || "",
      gpcode: initialData?.gpcode || "",
      gpnameinshort: initialData?.gpnameinshort || "",
      blockname: initialData?.blockname || "",
      gpshortname: initialData?.gpshortname || "",
      prodhanMessage: initialData?.prodhanMessage || "",
    },
  })

  // Form submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await saveGPProfile(values);
    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      })
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
    }
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

        <FormField
          control={form.control}
          name="prodhanMessage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prodhan Message</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter the welcome message for the landing page" 
                  className="h-32"
                  {...field} 
                />
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
