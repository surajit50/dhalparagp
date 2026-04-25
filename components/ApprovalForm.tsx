import { Suspense } from 'react'
import { getLatestMemoNumber } from '@/action/warishApplicationAction'
import ApprovalFormClient from './ApprovalFormClient'
import { generateMemoNumber } from '@/utils/utils'

export default async function ApprovalForm({ id }: { id: string }) {
    const currentYear = new Date().getFullYear()
    const latestNumber = await getLatestMemoNumber(currentYear)
    const initialMemoNumber = generateMemoNumber(latestNumber, currentYear)
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ApprovalFormClient id={id} initialMemoNumber={initialMemoNumber} />
        </Suspense>
    )
}
