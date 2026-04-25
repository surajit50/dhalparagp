"use client"
import { useState } from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const links = [
  { title: "West Bengal Government", url: "https://wb.gov.in/" },
  { title: "Panchayati Raj Department", url: "https://wbprd.gov.in/" },
  { title: "e-Panchayat", url: "https://epanchayat.gov.in/" },
  { title: "Digital India", url: "https://www.digitalindia.gov.in/" },
  { title: "egram Swaraj", url: "https://egramswaraj.gov.in/" },
  { title: "Janma-Mrityutathya", url: "https://janma-mrityutathya.wb.gov.in/" },
  { title: "West Bengal Land Records (BanglarBhumi)", url: "https://banglarbhumi.gov.in/" },
  { title: "West Bengal Health & Family Welfare", url: "https://www.wbhealth.gov.in/" },
  { title: "West Bengal E-District Services", url: "https://edistrict.wb.gov.in/" },
  { title: "West Bengal Transport Department", url: "https://transport.wb.gov.in/" },
]

export default function UsefulLinksSection() {
  const [showAll, setShowAll] = useState(false)

  return (
    <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold">Useful Links</h2>
      </div>
      <CardContent className="p-6">
        <ul className="space-y-3">
          {links.slice(0, showAll ? links.length : 6).map((link, index) => (
            <li key={index} className="transition-all duration-300 hover:translate-x-1">
              <Link
                href={link.url}
                className="text-white hover:underline flex items-center group"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.title}
                <ExternalLink
                  className="h-4 w-4 ml-2 opacity-50 group-hover:opacity-100 transition-opacity"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
        {!showAll && (
          <div className="mt-4">
            <Button 
              onClick={() => setShowAll(true)} 
              className="bg-white text-indigo-600 hover:bg-indigo-100 w-full"
            >
              More Links
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
