"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { type UseFormReturn, useFieldArray, useWatch } from "react-hook-form";
import { ChevronDown, ChevronRight, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
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
import { TableCell, TableRow } from "@/components/ui/table";
import type { LinkageFormValuesType } from "./constants";

interface BeneficiaryFormRowProps {
  form: UseFormReturn<LinkageFormValuesType>;
  fieldArrayName: string;
  index: number;
  depth?: number;
  parentName?: string;
  onRemove: (index: number) => void;
}

// Relation options for beneficiaries
const beneficiaryRelations = [
  { value: "Son", label: "Son / পুত্র" },
  { value: "Daughter", label: "Daughter / কন্যা" },
  { value: "Child", label: "Child / সন্তান" },
  { value: "Wife", label: "Wife / স্ত্রী" },
  { value: "Husband", label: "Husband / স্বামী" },
  { value: "Spouse", label: "Spouse / জীবনসঙ্গী" },
  { value: "Father", label: "Father / পিতা" },
  { value: "Mother", label: "Mother / মাতা" },
  { value: "Parent", label: "Parent / অভিভাবক" },
  { value: "Brother", label: "Brother / ভাই" },
  { value: "Sister", label: "Sister / বোন" },
  { value: "Sibling", label: "Sibling / ভাইবোন" },
  { value: "Grandson", label: "Grandson / নাতি" },
  { value: "Granddaughter", label: "Granddaughter / নাতনি" },
  { value: "Grandchild", label: "Grandchild / নাতি-নাতনি" },
  { value: "Uncle", label: "Uncle / কাকা-জ্যাঠা-মামা" },
  { value: "Aunt", label: "Aunt / পিসি-মাসি-কাকিমা" },
  { value: "Nephew", label: "Nephew / ভাতিজা-ভাগ্নে" },
  { value: "Niece", label: "Niece / ভাতিজি-ভাগ্নি" },
  { value: "Other", label: "Other / অন্যান্য" },
];

const canonicalRelationValues = new Set(beneficiaryRelations.map((item) => item.value));

export const BeneficiaryFormRow: React.FC<BeneficiaryFormRowProps> = ({
  form,
  fieldArrayName,
  index,
  depth = 0,
  parentName,
  onRemove,
}) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `${fieldArrayName}.${index}.children` as any,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const genderValue = useWatch({
    control: form.control,
    name: `${fieldArrayName}.${index}.gender` as any,
  });
  const relationValue = useWatch({
    control: form.control,
    name: `${fieldArrayName}.${index}.relation` as any,
  });
  const currentName = useWatch({
    control: form.control,
    name: `${fieldArrayName}.${index}.name` as any,
  });
  const relationFieldPath = `${fieldArrayName}.${index}.relation` as any;
  const normalizedParentName = parentName?.trim();
  const isHeadNode = depth === 0;

  useEffect(() => {
    if (isHeadNode && relationValue !== "Head") {
      form.setValue(relationFieldPath, "Head", {
        shouldDirty: true,
      });
    }
  }, [form, isHeadNode, relationFieldPath, relationValue]);

  const relationOptions = useMemo(() => {
    if (isHeadNode) {
      return [{ value: "Head", label: "Head" }];
    }

    if (genderValue === "male") {
      return beneficiaryRelations.filter((item) => item.value !== "Wife");
    }
    if (genderValue === "female") {
      return beneficiaryRelations.filter((item) => item.value !== "Husband");
    }
    return beneficiaryRelations;
  }, [genderValue, isHeadNode]);

  const getRelationLabel = (relation: string) => {
    if (isHeadNode) return "Head";
    if (!normalizedParentName) return relation;
    return `${relation} of ${normalizedParentName}`;
  };

  const relationSelectDisplayValue = relationValue
    ? getRelationLabel(relationValue)
    : undefined;

  const isCustomRelationValue =
    Boolean(relationValue) &&
    !isHeadNode &&
    !canonicalRelationValues.has(relationValue);

  const handleAppendChild = () => {
    append({
      name: "",
      gender: "male",
      relation: "",
      livingStatus: "alive",
      age: undefined,
      children: [],
    } as any);
    setIsExpanded(true);
  };

  // Capitalize each word
  const capitalizeWords = (str: string) => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <>
      <TableRow
        className={cn(
          depth > 0 && "bg-muted/20",
          `nest-level-${depth} hover:bg-muted/10 transition-colors`
        )}
      >
        {/* Serial Number */}
        <TableCell className={`p-2 pl-${depth * 4 + 2}`}>
          {fields.length > 0 && (
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

        {/* Name */}
        <TableCell className="p-2">
          <FormField
            control={form.control}
            name={`${fieldArrayName}.${index}.name` as any}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) =>
                      field.onChange(capitalizeWords(e.target.value))
                    }
                    aria-label="Name"
                    autoFocus={depth === 0}
                    className={cn(
                      "w-full h-8 text-sm border-l-4",
                      depth === 0
                        ? "border-l-primary"
                        : `border-l-primary-${depth + 1}00`
                    )}
                    placeholder={`Level ${depth + 1} Beneficiary`}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
        </TableCell>

        {/* Gender */}
        <TableCell className="p-2">
          <FormField
            control={form.control}
            name={`${fieldArrayName}.${index}.gender` as any}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full h-8 text-sm">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male / পুরুষ</SelectItem>
                      <SelectItem value="female">Female / মহিলা</SelectItem>
                      <SelectItem value="other">Other / অন্যান্য</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
        </TableCell>

        {/* Relation */}
        <TableCell className="p-2">
          <FormField
            control={form.control}
            name={`${fieldArrayName}.${index}.relation` as any}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full h-8 text-sm">
                      <SelectValue
                        placeholder={
                          isHeadNode ? "Head" : "Select Relation"
                        }
                      >
                        {relationSelectDisplayValue}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {relationOptions.map((item) => (
                        <SelectItem value={item.value} key={item.value}>
                          {getRelationLabel(item.value)}
                        </SelectItem>
                      ))}
                      {isCustomRelationValue && (
                          <SelectItem value={field.value}>
                            {getRelationLabel(field.value)}
                          </SelectItem>
                        )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
        </TableCell>

        {/* Age */}
        <TableCell className="p-2">
          <FormField
            control={form.control}
            name={`${fieldArrayName}.${index}.age` as any}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    className="w-full h-8 text-sm"
                    placeholder="Age"
                    aria-label="Age"
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
        </TableCell>

        {/* Living Status */}
        <TableCell className="p-2">
          <FormField
            control={form.control}
            name={`${fieldArrayName}.${index}.livingStatus` as any}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full h-8 text-sm">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alive">Alive / জীবিত</SelectItem>
                      <SelectItem value="dead">Dead / মৃত</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
        </TableCell>

        {/* Actions */}
        <TableCell className="p-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-sm bg-red-50 hover:bg-red-100 text-red-600"
              onClick={() => onRemove(index)}
              aria-label="Remove Beneficiary"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-sm bg-green-50 hover:bg-green-100 text-green-600"
              onClick={handleAppendChild}
              aria-label="Add Child Beneficiary"
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* Children rows */}
      {isExpanded &&
        fields.map((field, childIndex) => (
          <BeneficiaryFormRow
            key={field.id}
            form={form}
            fieldArrayName={`${fieldArrayName}.${index}.children`}
            index={childIndex}
            depth={depth + 1}
            parentName={currentName?.trim()}
            onRemove={(childIndex) => remove(childIndex)}
          />
        ))}
    </>
  );
};
