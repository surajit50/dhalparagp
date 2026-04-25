import TempleteCart from '@/components/TempleteCart'
import { db } from '@/lib/db'
import React from 'react'
import { FaChartLine } from 'react-icons/fa'

const page = async () => {
    const techev = await db.nitDetails.count({
    })

    const status = {
        title: "NIT",
        value: techev,
        icon: FaChartLine,
        change: "+3%",
        color: "text-yellow-500",
    }
    return (
        <TempleteCart stat={status} />
    )
}

export default page