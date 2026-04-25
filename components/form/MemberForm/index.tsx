"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

import { toast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"
import Image from "next/image"

import { addmemberdetails } from "@/action/memberAction"
import { getMouzaList } from "@/action/villagemanage"
import { MemberFormData, memberFormSchema } from "@/schema/member"

import {
  Loader2,
  Upload,
  UserPlus,
  IdCard,
  Contact,
  Banknote,
  Camera
} from "lucide-react"

import { memberFormformSections, selectOptions } from "@/constants"
import { useRouter } from "next/navigation"

import { fetchAddressFromPin } from "@/lib/pincode"

export default function MemberForm() {

const router = useRouter()

const [photoPreview,setPhotoPreview] = useState<string | null>(null)
const [isSubmitting,setIsSubmitting] = useState(false)
const [postOffices,setPostOffices] = useState<string[]>([])
const [pinLoading,setPinLoading] = useState(false)
const [mouzas, setMouzas] = useState<any[]>([])

useEffect(() => {
  const loadMouzas = async () => {
    const data = await getMouzaList()
    setMouzas(data)
  }
  loadMouzas()
}, [])

const form = useForm<MemberFormData>({
resolver:zodResolver(memberFormSchema),

defaultValues:{
salutation:"",
firstName:"",
middleName:"",
lastName:"",
fatherGuardianName:"",
dob:"",
gender:"",
maritalStatus:"",
religion:"",
caste:"",
eduQualification:"",
computerLiterate:"",
motherTongue:"",
bloodGroup:"",
contactNo:"",
whatsappNo:"",
email:"",
address:"",
village:"",
pin:"",
postOffice:"",
district:"",
policeStation:"",
aadhar:"",
pan:"",
epic:"",
profession:"",
annualFamilyIncome:"",
mouzaIds: [],
politicalParty: "",
photo:undefined
}

})

/* ---------- PIN AUTO DETECT ---------- */

const handlePinChange = async(pin:string)=>{

form.setValue("pin",pin)

if(pin.length !== 6) return

setPinLoading(true)

const address = await fetchAddressFromPin(pin)

if(address){

form.setValue("district",address.district)

setPostOffices(address.postOffices)

}else{

setPostOffices([])

}

setPinLoading(false)

}

/* ---------- SUBMIT ---------- */

const onSubmit = async(data:MemberFormData)=>{

setIsSubmitting(true)

try{

const formData = new FormData()

Object.entries(data).forEach(([key,value])=>{

if(value!==undefined && value!==null){

if(key==="photo" && value instanceof File){

formData.append(key,value)

} else if (Array.isArray(value)) {

formData.append(key, JSON.stringify(value))

}else{

formData.append(key,value.toString())

}

}

})

const result = await addmemberdetails(formData)

if(result.error){
throw new Error(result.error)
}

toast({
title:"Success",
description:result.success
})

form.reset()
setPhotoPreview(null)

router.push("/admindashboard/viewmenberdetails")

}catch(error){

toast({
title:"Error",
description:"Error submitting form",
variant:"destructive"
})

}finally{
setIsSubmitting(false)
}

}

/* ---------- FIELD RENDER ---------- */

const renderField = (name:keyof MemberFormData)=>{

/* SELECT */

if(selectOptions[name as keyof typeof selectOptions]){

return(

<Select
onValueChange={(value)=>form.setValue(name,value)}
value={form.getValues(name) as string}
>

<FormControl>

<SelectTrigger>
<SelectValue placeholder={`Select ${name}`} />
</SelectTrigger>

</FormControl>

<SelectContent>

{selectOptions[name as keyof typeof selectOptions].map((option)=>(
<SelectItem key={option} value={option}>
{option}
</SelectItem>
))}

</SelectContent>

</Select>

)

}

/* PHOTO */

if(name==="photo"){

return(

<div className="space-y-4">

<label
htmlFor="photo-upload"
className="group relative block w-full h-32 border-2 border-dashed border-muted rounded-lg hover:border-primary cursor-pointer"
>

<div className="absolute inset-0 flex flex-col items-center justify-center gap-2">

<Upload className="h-8 w-8 text-muted-foreground"/>

<span className="text-sm">
Click to upload photo
</span>

</div>

<Input
id="photo-upload"
type="file"
accept="image/*"
className="hidden"

onChange={(e)=>{

const file = e.target.files?.[0]

if(file){

form.setValue("photo",file)

setPhotoPreview(URL.createObjectURL(file))

}

}}

/>

</label>

{photoPreview &&(

<div className="relative w-40 h-40 rounded-md overflow-hidden border">

<Image
src={photoPreview}
alt="Preview"
fill
className="object-cover"
/>

</div>

)}

</div>

)

}

/* PIN */

if(name==="pin"){

return(

<div className="relative">

<Input
maxLength={6}
value={form.getValues("pin")}

onChange={(e)=>handlePinChange(e.target.value)}

/>

{pinLoading &&(
<Loader2 className="animate-spin h-4 w-4 absolute right-3 top-3"/>
)}

</div>

)

}

/* POST OFFICE */

if(name==="postOffice"){

return(

<Select
onValueChange={(value)=>form.setValue("postOffice",value)}
value={form.getValues("postOffice")}
>

<SelectTrigger>

<SelectValue placeholder="Select Post Office"/>

</SelectTrigger>

<SelectContent>

{postOffices.map((po)=>(
<SelectItem key={po} value={po}>
{po}
</SelectItem>
))}

</SelectContent>

</Select>

)

}

/* MOUZAS */

if(name==="mouzaIds"){

return(

<div className="grid grid-cols-2 gap-4 border p-4 rounded-md">

{mouzas.map((m)=>(

<div key={m.id} className="flex items-center space-x-2">

<Checkbox
id={`mouza-${m.id}`}
checked={(form.getValues("mouzaIds") as string[] || []).includes(m.id)}

onCheckedChange={(checked)=>{

const current = form.getValues("mouzaIds") as string[] || []

if(checked){
form.setValue("mouzaIds",[...current,m.id])
}else{
form.setValue("mouzaIds",current.filter((id)=>id!==m.id))
}

}}

/>

<label
htmlFor={`mouza-${m.id}`}
className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
>
{m.name}
</label>

</div>

))}

</div>

)

}

return(

<Input
{...form.register(name)}
/>

)

}

/* ---------- UI ---------- */

return(

<div className="container mx-auto py-10 px-4">

<div className="max-w-5xl mx-auto space-y-8">

<div className="text-center">

<UserPlus className="h-10 w-10 mx-auto text-primary"/>

<h1 className="text-3xl font-bold">
Member Registration
</h1>

</div>

<Form {...form}>

<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

{memberFormformSections.map((section)=>(

<Card key={section.title}>

<CardHeader>

<CardTitle>

{section.title}

</CardTitle>

</CardHeader>

<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">

{section.fields.map((field)=>(

<FormField
key={field}
control={form.control}
name={field as keyof MemberFormData}

render={()=>(

<FormItem
className={['address','photo'].includes(field) ? 'col-span-full':''}
>

<FormLabel>

{field.charAt(0).toUpperCase() +
field.slice(1).replace(/([A-Z])/g," $1")}

</FormLabel>

<FormControl>

{renderField(field as keyof MemberFormData)}

</FormControl>

<FormMessage/>

</FormItem>

)}

>

</FormField>

))}

</CardContent>

</Card>

))}

<div className="flex justify-center">

<Button
type="submit"
disabled={isSubmitting}
className="px-10 py-6 text-lg"
>

{isSubmitting ? (
<>
<Loader2 className="animate-spin mr-2"/>
Saving...
</>
) : (
<>
<UserPlus className="mr-2"/>
Register Member
</>
)}

</Button>

</div>

</form>

</Form>

</div>

</div>

)

}
