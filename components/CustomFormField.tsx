"use client"

import React from "react"
import { Control } from "react-hook-form"
import { E164Number } from "libphonenumber-js/core"
import ReactDatePicker from "react-datepicker"
import PhoneInput from "react-phone-number-input"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

import "react-datepicker/dist/react-datepicker.css"

/* ===========================================================
   ENUM
=========================================================== */

export enum FormFieldType {
  INPUT = "input",
  NUMBER = "number",
  TEXTAREA = "textarea",
  PHONE_INPUT = "phoneInput",
  CHECKBOX = "checkbox",
  DATE_PICKER = "datePicker",
  SELECT = "select",
  OTP = "otp",
  RADIO = "radio",
  SKELETON = "skeleton",
}

/* ===========================================================
   PROPS
=========================================================== */

interface CustomProps {
  control: Control<any>
  name: string
  label?: string
  placeholder?: string
  disabled?: boolean
  dateFormat?: string
  showTimeSelect?: boolean
  fieldType: FormFieldType
  otpLength?: number
  options?: { label: string; value: string }[]
  renderSkeleton?: (field: any) => React.ReactNode
  containerClass?: string
  inputClass?: string
  minTime?: Date
maxTime?: Date
timeIntervals?: number
  includeTimes?: Date[]
}

/* ===========================================================
   LABEL FORMAT
=========================================================== */

const formatLabel = (label: string): string => {
  return label
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/_/g, " ")
    .trim()
}

/* ===========================================================
   NIC STYLE BASE INPUT
=========================================================== */

const nicInputStyle =
  "w-full h-10 rounded-md border border-gray-400 bg-white px-3 text-sm focus:outline-none focus:border-orange-700 focus:ring-1 focus:ring-orange-700 disabled:bg-gray-100 disabled:cursor-not-allowed"

/* ===========================================================
   INPUT RENDERER
=========================================================== */

const RenderInput = ({ field, props }: { field: any; props: CustomProps }) => {
  switch (props.fieldType) {

    case FormFieldType.INPUT:
      return (
        <FormControl>
          <Input
            {...field}
            disabled={props.disabled}
            placeholder={props.placeholder}
            className={`${nicInputStyle} ${props.inputClass}`}
          />
        </FormControl>
      )

    case FormFieldType.NUMBER:
      return (
        <FormControl>
          <Input
            type="number"
            {...field}
            disabled={props.disabled}
            placeholder={props.placeholder}
            className={`${nicInputStyle} ${props.inputClass}`}
          />
        </FormControl>
      )

    case FormFieldType.TEXTAREA:
      return (
        <FormControl>
          <Textarea
            {...field}
            disabled={props.disabled}
            placeholder={props.placeholder}
            className="min-h-[90px] rounded-md border border-gray-400 bg-white px-3 py-2 text-sm focus:outline-none focus:border-orange-700 focus:ring-1 focus:ring-orange-700"
          />
        </FormControl>
      )

    case FormFieldType.PHONE_INPUT:
      return (
        <FormControl>
          <PhoneInput
            defaultCountry="IN"
            value={field.value as E164Number | undefined}
            onChange={field.onChange}
            placeholder={props.placeholder}
            className={nicInputStyle}
          />
        </FormControl>
      )

    case FormFieldType.DATE_PICKER:
  return (
    <FormControl>
      <ReactDatePicker
        selected={field.value}
        onChange={(date: Date | null) => field.onChange(date)}

        // ✅ Enable time
        showTimeSelect={props.showTimeSelect ?? false}

        // ✅ 24-HOUR FORMAT
        dateFormat={props.dateFormat ?? "dd/MM/yyyy HH:mm"}
        timeFormat="HH:mm"
        timeCaption="Time"

        // ✅ CONTROL FROM FORM
        minTime={props.minTime}
        maxTime={props.maxTime}
        timeIntervals={props.timeIntervals ?? 5}

        wrapperClassName="w-full"
        className={nicInputStyle}
      />
    </FormControl>
  )
    case FormFieldType.SELECT:
      return (
        <FormControl>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <SelectTrigger className={nicInputStyle}>
              <SelectValue placeholder={props.placeholder} />
            </SelectTrigger>

            <SelectContent className="border border-gray-400 rounded-md bg-white">
              {props.options?.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-sm"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormControl>
      )

    case FormFieldType.CHECKBOX:
      return (
        <FormControl>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              id={props.name}
              className="border border-gray-500 data-[state=checked]:bg-orange-700 data-[state=checked]:border-orange-700"
            />
            <label
              htmlFor={props.name}
              className="text-sm text-gray-800 cursor-pointer"
            >
              {props.label}
            </label>
          </div>
        </FormControl>
      )

    case FormFieldType.RADIO:
      return (
        <FormControl>
          <div className="space-y-2">
            {props.options?.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="radio"
                  value={option.value}
                  checked={field.value === option.value}
                  onChange={() => field.onChange(option.value)}
                  className="accent-orange-700"
                />
                {option.label}
              </label>
            ))}
          </div>
        </FormControl>
      )

    case FormFieldType.OTP:
      return (
        <FormControl>
          <InputOTP
            maxLength={props.otpLength || 6}
            {...field}
            render={({ slots }) => (
              <InputOTPGroup className="gap-2">
                {slots.map((slot, index) => (
                  <React.Fragment key={index}>
                    <InputOTPSlot
                      {...slot}
                      index={index}
                      className="w-9 h-9 border border-gray-400 rounded-md focus:border-orange-700"
                    />
                    {index !== slots.length - 1 && (
                      <InputOTPSeparator />
                    )}
                  </React.Fragment>
                ))}
              </InputOTPGroup>
            )}
          />
        </FormControl>
      )

    case FormFieldType.SKELETON:
      return props.renderSkeleton
        ? props.renderSkeleton(field)
        : null

    default:
      return null
  }
}

/* ===========================================================
   MAIN COMPONENT
=========================================================== */

const CustomFormField = (props: CustomProps) => {
  return (
    <FormField
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className={`mb-4 ${props.containerClass}`}>
          {props.fieldType !== FormFieldType.CHECKBOX && (
            <FormLabel className="block text-sm font-semibold text-gray-900 mb-1">
              {props.label || formatLabel(props.name)}
            </FormLabel>
          )}

          <RenderInput field={field} props={props} />

          <FormMessage className="text-xs text-red-600 mt-1" />
        </FormItem>
      )}
    />
  )
}

export default CustomFormField
