
import TempleteCart from '@/components/TempleteCart'
import { db } from '@/lib/db'
import React from 'react'
import { FaUsers } from 'react-icons/fa';
const page = async () => {


    const visitor = await db.visitor.findFirst({ select: { totalVisitors: true } })

    const stat = {
        title: "Total Visitors",
        value: visitor?.totalVisitors || 0,
        icon: FaUsers,
        change: "+10%",
        color: "text-blue-500",
    }



    return (
        <TempleteCart stat={stat} />
    )
}

export default page