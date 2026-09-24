import type React from "react";
import type { UseFormReturn } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WarishFormValuesType } from "@/schema/warishSchema";
import { BilingualLabel } from "./bilingual-label";
import { villagenameOption } from "@/constants";
import { formatDate } from "@/utils/utils";

interface ApplicationInfoProps {
  form: UseFormReturn<WarishFormValuesType>;
}

export const ApplicationInfo: React.FC<ApplicationInfoProps> = ({ form }) => {
  const materialdece = form.watch("maritialStatus");
  const relationValue = form.watch("relationwithdeceased");

  // Function to capitalize each word
  const capitalizeWords = (str: string) => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5 md:p-6 bg-gradient-to-br from-gray-50 via-white to-slate-50 rounded-2xl border border-gray-200 shadow-inner">
      <FormField
        control={form.control}
        name="reportingDate"
        render={({ field }) => (
          <FormItem className="flex flex-col space-y-2">
            <FormLabel className="text-sm font-bold text-gray-700">
              <BilingualLabel
                english="Reporting Date"
                bengali="রিপোর্টিং তারিখ"
              />
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full h-11 px-4 text-left text-sm font-medium bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-primary/30 transition-all duration-200 rounded-xl shadow-sm",
                      !field.value && "text-gray-400"
                    )}
                    disabled
                  >
                    {field.value ? (
                      formatDate(field.value)
                    ) : (
                      <span>Pick a date / তারিখ নির্বাচন করুন</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 shadow-lg rounded-xl border border-gray-200" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage className="text-xs text-red-500 font-medium" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="applicantName"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-bold text-gray-700">
              <BilingualLabel
                english="Applicant Name"
                bengali="আবেদনকারীর নাম"
              />
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Applicant Name / আবেদনকারীর নাম"
                {...field}
                onChange={(e) => field.onChange(capitalizeWords(e.target.value))}
                className="h-11 text-sm bg-white border-2 border-gray-200 rounded-xl px-4 shadow-sm focus:border-primary focus:ring-primary/20 hover:border-gray-300 transition-all duration-200"
              />
            </FormControl>
            <FormMessage className="text-xs text-red-500 font-medium" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="applicantMobileNumber"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-bold text-gray-700">
              <BilingualLabel english="Mobile Number" bengali="মোবাইল নম্বর" />
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Enter Mobile Number / মোবাইল নম্বর দিন"
                {...field}
                className="h-11 text-sm bg-white border-2 border-gray-200 rounded-xl px-4 shadow-sm focus:border-primary focus:ring-primary/20 hover:border-gray-300 transition-all duration-200"
              />
            </FormControl>
            <FormMessage className="text-xs text-red-500 font-medium" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="relationwithdeceased"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-bold text-gray-700">
              <BilingualLabel
                english="Relation with Deceased"
                bengali="মৃত ব্যক্তির সাথে সম্পর্ক"
              />
            </FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
              >
                <SelectTrigger className="h-11 text-sm bg-white border-2 border-gray-200 rounded-xl px-4 shadow-sm focus:border-primary focus:ring-primary/20 hover:border-gray-300 transition-all duration-200">
                  <SelectValue placeholder="Select Relation / সম্পর্ক নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-gray-200 shadow-lg">
                  <SelectItem value="son">Son / পুত্র</SelectItem>
                  <SelectItem value="daughter">Daughter / কন্যা</SelectItem>
                  <SelectItem value="wife">Wife / স্ত্রী</SelectItem>
                  <SelectItem value="husband">Husband / স্বামী</SelectItem>
                  <SelectItem value="father">Father / পিতা</SelectItem>
                  <SelectItem value="mother">Mother / মাতা</SelectItem>
                  <SelectItem value="brother">Brother / ভাই</SelectItem>
                  <SelectItem value="sister">Sister / বোন</SelectItem>
                  <SelectItem value="grandson">Grandson / নাতি</SelectItem>
                  <SelectItem value="granddaughter">
                    Granddaughter / নাতনি
                  </SelectItem>
                  <SelectItem value="other">Other / অন্যান্য</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage className="text-xs text-red-500 font-medium" />
          </FormItem>
        )}
      />

      {relationValue === "other" && (
        <FormField
          control={form.control}
          name="relationwithdeceased"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-bold text-gray-700">
                <BilingualLabel
                  english="Specify Other Relation"
                  bengali="অন্যান্য সম্পর্ক উল্লেখ করুন"
                />
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Specify other relation / অন্যান্য সম্পর্ক উল্লেখ করুন"
                  value={field.value === "other" ? "" : field.value}
                  onChange={(e) =>
                    field.onChange(capitalizeWords(e.target.value))
                  }
                  className="h-11 text-sm bg-white border-2 border-gray-200 rounded-xl px-4 shadow-sm focus:border-primary focus:ring-primary/20 hover:border-gray-300 transition-all duration-200"
                />
              </FormControl>
              <FormMessage className="text-xs text-red-500 font-medium" />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="nameOfDeceased"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-bold text-gray-700">
              <BilingualLabel
                english="Name of Deceased"
                bengali="মৃত ব্যক্তির নাম"
              />
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Name of Deceased / মৃত ব্যক্তির নাম"
                {...field}
                onChange={(e) => field.onChange(capitalizeWords(e.target.value))}
                className="h-11 text-sm bg-white border-2 border-gray-200 rounded-xl px-4 shadow-sm focus:border-primary focus:ring-primary/20 hover:border-gray-300 transition-all duration-200"
              />
            </FormControl>
            <FormMessage className="text-xs text-red-500 font-medium" />
          </FormItem>
        )}
      />

      <FormField
  control={form.control}
  name="dateOfDeath"
  render={({ field }) => (
    <FormItem className="flex flex-col space-y-2">
      <FormLabel className="text-sm font-bold text-gray-700">
        <BilingualLabel
          english="Date of Death"
          bengali="মৃত্যুর তারিখ"
        />
      </FormLabel>

      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full h-11 px-4 text-left text-sm font-medium bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-primary/30 justify-between rounded-xl shadow-sm transition-all duration-200",
                !field.value && "text-muted-foreground"
              )}
            >
              {field.value ? (
                formatDate(new Date(field.value))
              ) : (
                <span>
                  Pick a date / তারিখ নির্বাচন করুন
                </span>
              )}

              <CalendarIcon className="h-4 w-4 opacity-60" />
            </Button>
          </FormControl>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto p-0 shadow-lg border border-gray-200 rounded-xl"
          align="start"
        >
          <Calendar
            mode="single"
            selected={field.value ? new Date(field.value) : undefined}
            onSelect={(date) => {
              field.onChange(date);
            }}
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
            initialFocus
            captionLayout="dropdown"
            fromYear={1900}
            toYear={new Date().getFullYear()}
            classNames={{
              caption_dropdowns: "flex justify-center gap-2 px-3 pt-2",
              dropdown:
                "px-2 py-1 border rounded-md bg-white text-sm focus:outline-none",
              vhidden: "sr-only",
            }}
          />
        </PopoverContent>
      </Popover>

      <FormMessage className="text-xs text-red-500 font-medium" />
    </FormItem>
  )}
/>

      <FormField
        control={form.control}
        name="gender"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-bold text-gray-700">
              <BilingualLabel english="Gender" bengali="লিঙ্গ" />
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-3"
              >
                <FormItem className="flex items-center space-x-2 flex-1 p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-primary/30 transition-all duration-200 cursor-pointer shadow-sm">
                  <FormControl>
                    <RadioGroupItem
                      value="male"
                      id="gender-male"
                      className="text-primary"
                    />
                  </FormControl>
                  <FormLabel
                    htmlFor="gender-male"
                    className="text-sm font-semibold text-gray-700 cursor-pointer"
                  >
                    Male / পুরুষ
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2 flex-1 p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-primary/30 transition-all duration-200 cursor-pointer shadow-sm">
                  <FormControl>
                    <RadioGroupItem
                      value="female"
                      id="gender-female"
                      className="text-primary"
                    />
                  </FormControl>
                  <FormLabel
                    htmlFor="gender-female"
                    className="text-sm font-semibold text-gray-700 cursor-pointer"
                  >
                    Female / মহিলা
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage className="text-xs text-red-500 font-medium" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="maritialStatus"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-bold text-gray-700">
              <BilingualLabel
                english="Marital Status"
                bengali="বৈবাহিক অবস্থা"
              />
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-3"
              >
                <FormItem className="flex items-center space-x-2 flex-1 p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-primary/30 transition-all duration-200 cursor-pointer shadow-sm">
                  <FormControl>
                    <RadioGroupItem
                      value="married"
                      id="marital-status-married"
                      className="text-primary"
                    />
                  </FormControl>
                  <FormLabel
                    htmlFor="marital-status-married"
                    className="text-sm font-semibold text-gray-700 cursor-pointer"
                  >
                    Married / বিবাহিত
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2 flex-1 p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-primary/30 transition-all duration-200 cursor-pointer shadow-sm">
                  <FormControl>
                    <RadioGroupItem
                      value="unmarried"
                      id="marital-status-unmarried"
                      className="text-primary"
                    />
                  </FormControl>
                  <FormLabel
                    htmlFor="marital-status-unmarried"
                    className="text-sm font-semibold text-gray-700 cursor-pointer"
                  >
                    Unmarried / অবিবাহিত
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage className="text-xs text-red-500 font-medium" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fatherName"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-bold text-gray-700">
              <BilingualLabel english="Fathers Name" bengali="পিতার নাম" />
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Enter Fathers Name / পিতার নাম লিখুন"
                {...field}
                onChange={(e) => field.onChange(capitalizeWords(e.target.value))}
                className="h-11 text-sm bg-white border-2 border-gray-200 rounded-xl px-4 shadow-sm focus:border-primary focus:ring-primary/20 hover:border-gray-300 transition-all duration-200"
              />
            </FormControl>
            <FormMessage className="text-xs text-red-500 font-medium" />
          </FormItem>
        )}
      />

      {materialdece === "married" && (
        <FormField
          control={form.control}
          name="spouseName"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-bold text-gray-700">
                <BilingualLabel
                  english="Spouses Name"
                  bengali="স্বামী/স্ত্রীর নাম"
                />
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter Spouses Name / স্বামী/স্ত্রীর নাম লিখুন"
                  {...field}
                  onChange={(e) =>
                    field.onChange(capitalizeWords(e.target.value))
                  }
                  className="h-11 text-sm bg-white border-2 border-gray-200 rounded-xl px-4 shadow-sm focus:border-primary focus:ring-primary/20 hover:border-gray-300 transition-all duration-200"
                />
              </FormControl>
              <FormMessage className="text-xs text-red-500 font-medium" />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="villageName"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-bold text-gray-700">
              <BilingualLabel english="Village Name" bengali="গ্রামের নাম" />
            </FormLabel>
            <FormControl>
              <Select 
                value={field.value} 
                onValueChange={(value) => {
                  field.onChange(value);
                  if (value === "Purbba Gobindapur") {
                    form.setValue("postOffice", "Fatepur");
                  } else {
                    form.setValue("postOffice", "Trimohini");
                  }
                }}
              >
                <SelectTrigger className="w-full h-11 text-sm bg-white border-2 border-gray-200 rounded-xl px-4 shadow-sm focus:border-primary focus:ring-primary/20 hover:border-gray-300 transition-all duration-200">
                  <SelectValue placeholder="Select Village / গ্রামের নাম নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-gray-200 shadow-lg">
                  {villagenameOption.map((item) => (
                    <SelectItem value={item.value} key={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage className="text-xs text-red-500 font-medium" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="postOffice"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-bold text-gray-700">
              <BilingualLabel english="Post Office" bengali="ডাকঘর" />
            </FormLabel>
            <FormControl>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
                disabled
              >
                <SelectTrigger className="w-full h-11 text-sm bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200 text-gray-600 cursor-not-allowed rounded-xl px-4 shadow-inner">
                  <SelectValue placeholder="Auto-filled based on village / গ্রাম অনুযায়ী স্বয়ংক্রিয়ভাবে পূরণ করা হবে" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-gray-200 shadow-lg">
                  <SelectItem value="Trimohini">Trimohini</SelectItem>
                  <SelectItem value="Fatepur">Fatepur</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage className="text-xs text-red-500 font-medium" />
          </FormItem>
        )}
      />
    </div>
  );
};
