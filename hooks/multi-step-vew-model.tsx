'use client'

import { useCallback, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Path, useForm, UseFormReturn, FieldValues, DefaultValues, DeepPartial } from "react-hook-form"
import * as z from "zod"

export type StepObjectType = {
    id: number
    title: string
    fields: string[]
}

type UseViewModelProps<T extends FieldValues> = {
    schema: z.ZodType<T>
    steps: StepObjectType[]
    initialValues?: DeepPartial<T>
    onSubmit: (values: T) => void | Promise<void>
}

type UseViewModelReturn<T extends FieldValues> = {
    step: number
    form: UseFormReturn<T>
    handleNext: () => Promise<void>
    handlePrev: () => void
    isLastStep: boolean
    isFirstStep: boolean
    steps: StepObjectType[]
    currentStepFields: Path<T>[]
    progress: number
}

export function useViewModel<T extends FieldValues>({
    schema,
    steps,
    initialValues,
    onSubmit
}: UseViewModelProps<T>): UseViewModelReturn<T> {
    const [step, setStep] = useState(1)

    const form = useForm<T>({
        resolver: zodResolver(schema),
        defaultValues: initialValues as DefaultValues<T>,
    })

    const isLastStep = useMemo(() => step === steps.length, [step, steps.length])
    const isFirstStep = useMemo(() => step === 1, [step])
    const progress = useMemo(() => (step / steps.length) * 100, [step, steps.length])

    const currentStepFields = useMemo(() =>
        steps[step - 1].fields as Path<T>[],
        [step, steps]
    )

    const handleNext = useCallback(async () => {
        const isValid = await form.trigger(currentStepFields)

        if (isValid && !isLastStep) {
            setStep((prev) => prev + 1)
        } else if (isValid && isLastStep) {
            await form.handleSubmit(onSubmit)()
        }
    }, [form, currentStepFields, isLastStep, onSubmit])

    const handlePrev = useCallback(() => {
        if (!isFirstStep) {
            setStep((prev) => prev - 1)
        }
    }, [isFirstStep])

    return {
        step,
        form,
        handleNext,
        handlePrev,
        isLastStep,
        isFirstStep,
        steps,
        currentStepFields,
        progress,
    }
}