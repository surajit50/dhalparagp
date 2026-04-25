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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg shadow-sm">
      <FormField
        control={form.control}
        name="reportingDate"
        render={({ field }) => (
          <FormItem className="flex flex-col space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">
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
                      "w-full h-10 px-3 text-left text-sm font-normal bg-white border-gray-300 hover:bg-gray-50",
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
              <PopoverContent className="w-auto p-0" align="start">
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
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="applicantName"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">
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
                className="h-10 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </FormControl>
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="applicantMobileNumber"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">
              <BilingualLabel english="Mobile Number" bengali="মোবাইল নম্বর" />
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Enter Mobile Number / মোবাইল নম্বর দিন"
                {...field}
                className="h-10 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </FormControl>
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="relationwithdeceased"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">
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
                <SelectTrigger className="h-10 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select Relation with Deceased / মৃত ব্যক্তির সাথে সম্পর্ক নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
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
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />

      {relationValue === "other" && (
        <FormField
          control={form.control}
          name="relationwithdeceased"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium text-gray-700">
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
                  className="h-10 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </FormControl>
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="nameOfDeceased"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">
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
                className="h-10 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </FormControl>
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />

      <FormField
  control={form.control}
  name="dateOfDeath"
  render={({ field }) => (
    <FormItem className="flex flex-col space-y-2">
      <FormLabel className="text-sm font-semibold text-gray-700">
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
                "w-full h-10 px-3 text-left text-sm font-normal bg-white border border-gray-300 hover:bg-gray-50 justify-between",
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
          className="w-auto p-0 shadow-lg border rounded-md"
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

      <FormMessage className="text-xs text-red-500" />
    </FormItem>
  )}
/>

      <FormField
        control={form.control}
        name="gender"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">
              <BilingualLabel english="Gender" bengali="লিঙ্গ" />
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <RadioGroupItem
                      value="male"
                      id="gender-male"
                      className="text-blue-500"
                    />
                  </FormControl>
                  <FormLabel
                    htmlFor="gender-male"
                    className="text-sm font-normal text-gray-700"
                  >
                    Male / পুরুষ
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <RadioGroupItem
                      value="female"
                      id="gender-female"
                      className="text-blue-500"
                    />
                  </FormControl>
                  <FormLabel
                    htmlFor="gender-female"
                    className="text-sm font-normal text-gray-700"
                  >
                    Female / মহিলা
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="maritialStatus"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">
              <BilingualLabel
                english="Marital Status"
                bengali="বৈবাহিক অবস্থা"
              />
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <RadioGroupItem
                      value="married"
                      id="marital-status-married"
                      className="text-blue-500"
                    />
                  </FormControl>
                  <FormLabel
                    htmlFor="marital-status-married"
                    className="text-sm font-normal text-gray-700"
                  >
                    Married / বিবাহিত
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <RadioGroupItem
                      value="unmarried"
                      id="marital-status-unmarried"
                      className="text-blue-500"
                    />
                  </FormControl>
                  <FormLabel
                    htmlFor="marital-status-unmarried"
                    className="text-sm font-normal text-gray-700"
                  >
                    Unmarried / অবিবাহিত
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fatherName"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">
              <BilingualLabel english="Fathers Name" bengali="পিতার নাম" />
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Enter Fathers Name / পিতার নাম লিখুন"
                {...field}
                onChange={(e) => field.onChange(capitalizeWords(e.target.value))}
                className="h-10 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </FormControl>
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />

      {materialdece === "married" && (
        <FormField
          control={form.control}
          name="spouseName"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium text-gray-700">
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
                  className="h-10 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </FormControl>
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="villageName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              <BilingualLabel english="Village Name" bengali="গ্রামের নাম" />
            </FormLabel>
            <FormControl>
              <Select 
                value={field.value} 
                onValueChange={(value) => {
                  field.onChange(value);
                  // Automatically set post office based on village selection
                  if (value === "Purbba Gobindapur") {
                    form.setValue("postOffice", "Fatepur");
                  } else {
                    form.setValue("postOffice", "Trimohini");
                  }
                }}
              >
                <SelectTrigger className="w-full h-10 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Enter Village / গ্রামের নাম লিখুন" />
                </SelectTrigger>
                <SelectContent>
                  {villagenameOption.map((item) => (
                    <SelectItem value={item.value} key={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="postOffice"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              <BilingualLabel english="Post Office" bengali="ডাকঘর" />
            </FormLabel>
            <FormControl>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
                disabled
              >
                <SelectTrigger className="w-full h-10 text-sm bg-gray-50 border-gray-300 text-gray-600 cursor-not-allowed">
                  <SelectValue placeholder="Auto-filled based on village / গ্রাম অনুযায়ী স্বয়ংক্রিয়ভাবে পূরণ করা হবে" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Trimohini">Trimohini</SelectItem>
                  <SelectItem value="Fatepur">Fatepur</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />
    </div>
  );
};
