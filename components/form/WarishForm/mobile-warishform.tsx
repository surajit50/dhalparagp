import React, { useState } from 'react'
import { useFieldArray, UseFormReturn } from 'react-hook-form'
import { ChevronDown, ChevronRight, PlusCircle, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormMessage, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface MobileWarishFormProps {
  form: UseFormReturn<any>;
  fieldArrayName: string;
  index: number;
  depth?: number;
  onRemove: (index: number) => void;
}

export function MobileWarishForm({ form, fieldArrayName, index, depth = 0, onRemove }: MobileWarishFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `${fieldArrayName}.${index}.children`,
  });

  const livingStatus = form.watch(`${fieldArrayName}.${index}.livingStatus`);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAppendChild = () => {
    if (livingStatus === 'dead') {
      append({ name: "", gender: "male", relation: "", livingStatus: "alive", maritialStatus: "unmarried", children: [] });
      setIsExpanded(true);
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full mb-4">
      <AccordionItem value={`item-${index}`}>
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-medium">Warish {index + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name={`${fieldArrayName}.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Warish name" className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${fieldArrayName}.${index}.gender`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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
              name={`${fieldArrayName}.${index}.maritialStatus`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marital Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select marital status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="unmarried">Unmarried</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${fieldArrayName}.${index}.relation`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relation</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Relation" className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${fieldArrayName}.${index}.livingStatus`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Living Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select living status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="alive">Alive</SelectItem>
                      <SelectItem value="dead">Dead</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onRemove(index)}
                className="flex-1 mr-2"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Remove
              </Button>
              {livingStatus === "dead" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAppendChild}
                  className="flex-1 ml-2"
                >
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Child
                </Button>
              )}
            </div>
          </div>
          {isExpanded && livingStatus === "dead" && fields.map((field, childIndex) => (
            <MobileWarishForm
              key={field.id}
              form={form}
              fieldArrayName={`${fieldArrayName}.${index}.children`}
              index={childIndex}
              depth={depth + 1}
              onRemove={(childIndex) => remove(childIndex)}
            />
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}