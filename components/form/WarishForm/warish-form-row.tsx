"use client"

import type React from "react"
import { useState } from "react"
import { type UseFormReturn, useFieldArray, useWatch } from "react-hook-form"
import { ChevronDown, ChevronRight, PlusCircle, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TableCell, TableRow } from "@/components/ui/table"
import type { WarishFormValuesType } from "@/schema/warishSchema"
import { maleRelationships, femaleRelationships } from "@/constants"

interface WarishFormRowProps {
  form: UseFormReturn<WarishFormValuesType>
  fieldArrayName: string
  index: number
  depth?: number
  onRemove: (index: number) => void
}

export const WarishFormRow: React.FC<WarishFormRowProps> = ({ form, fieldArrayName, index, depth = 0, onRemove }) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `${fieldArrayName}.${index}.children` as any,
  })

  const [isExpanded, setIsExpanded] = useState(false)

  const livingStatus = useWatch({
    control: form.control,
    name: `${fieldArrayName}.${index}.livingStatus` as any,
  })

  const gendervalue = useWatch({
    control: form.control,
    name: `${fieldArrayName}.${index}.gender` as any,
  })

  const maritalStatus = useWatch({
    control: form.control,
    name: `${fieldArrayName}.${index}.maritialStatus` as any,
  })

  const handleAppendChild = () => {
    if (livingStatus === "dead") {
      append({
        name: "",
        gender: "",
        relation: "",
        livingStatus: "alive",
        husbandName: "",
        maritialStatus: "unmarried",
        children: [],
      })
      setIsExpanded(true)
    }
  }

  // Function to capitalize each word
  const capitalizeWords = (str: string) => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <>
      <TableRow
        key={index}
        className={cn(
          depth > 0 && "bg-muted/20",
          `nest-level-${depth} hover:bg-muted/10 transition-colors`
        )}
      >
        <TableCell className={`p-2 pl-${depth * 4 + 2}`}>
          {livingStatus === "dead" && fields.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="p-0 h-6 w-6 text-primary hover:bg-primary/10"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          <span className="text-sm font-medium">{index + 1}</span>
        </TableCell>
        <TableCell className="p-2">
          <FormField
            control={form.control}
            name={`${fieldArrayName}.${index}.name` as any}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => field.onChange(capitalizeWords(e.target.value))}
                    aria-label="Name"
                    autoFocus={depth === 0}
                    className={cn(
                      "w-full h-8 text-sm border-l-4",
                      depth === 0
                        ? "border-l-primary"
                        : `border-l-primary-${depth + 1}00`
                    )}
                    placeholder={`Level ${depth + 1} Warish`}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
        </TableCell>
        <TableCell className="p-2">
          <FormField
            control={form.control}
            name={`${fieldArrayName}.${index}.gender` as any}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full h-8 text-sm">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
        </TableCell>
        <TableCell className="p-2">
          <FormField
            control={form.control}
            name={`${fieldArrayName}.${index}.maritialStatus` as any}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full h-8 text-sm">
                      <SelectValue placeholder="Select Marital Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="unmarried">Unmarried</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
        </TableCell>
        <TableCell className="p-2">
          <FormField
            control={form.control}
            name={`${fieldArrayName}.${index}.relation` as any}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full h-8 text-sm">
                      <SelectValue placeholder="Select Relation" />
                    </SelectTrigger>
                    <SelectContent>
                      {gendervalue === "female"
                        ? femaleRelationships.map((item) => (
                            <SelectItem value={item.value} key={item.value}>
                              {item.label}
                            </SelectItem>
                          ))
                        : maleRelationships.map((item) => (
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
        </TableCell>
        <TableCell className="p-2">
          <FormField
            control={form.control}
            name={`${fieldArrayName}.${index}.livingStatus` as any}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full h-8 text-sm">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alive">Alive</SelectItem>
                      <SelectItem value="dead">Dead</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
        </TableCell>
        <TableCell className="p-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-sm bg-red-50 hover:bg-red-100 text-red-600"
              onClick={() => onRemove(index)}
              aria-label="Remove Warish"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {livingStatus === "dead" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-sm bg-green-50 hover:bg-green-100 text-green-600"
                onClick={handleAppendChild}
                aria-label="Add Child Warish"
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      {gendervalue === "female" && maritalStatus === "married" && (
        <TableRow>
          <TableCell colSpan={7} className="p-2 bg-muted/10">
            <FormField
              control={form.control}
              name={`${fieldArrayName}.${index}.husbandName` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Husband Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) =>
                        field.onChange(capitalizeWords(e.target.value))
                      }
                      className="w-full md:w-1/2 h-8 text-sm"
                      placeholder="Husband's Name"
                      aria-label="Husband's Name"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />
          </TableCell>
        </TableRow>
      )}

      {isExpanded &&
        livingStatus === "dead" &&
        fields.map((field, childIndex) => (
          <WarishFormRow
            key={field.id}
            form={form}
            fieldArrayName={`${fieldArrayName}.${index}.children`}
            index={childIndex}
            depth={depth + 1}
            onRemove={(childIndex) => remove(childIndex)}
          />
        ))}
    </>
  )
}
