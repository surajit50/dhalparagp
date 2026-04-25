
'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Copy, Check, Eye, EyeOff } from "lucide-react"
import { comprehensiveFamilyRelationships } from '@/constants'

type Relationship = {
  English: string
  Bengali: string
}

export default function Component() {
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const filteredRelationships = useMemo(() => 
    comprehensiveFamilyRelationships.filter(
      (relationship) =>
        relationship.English.toLowerCase().includes(searchTerm.toLowerCase()) ||
        relationship.Bengali.includes(searchTerm)
    ),
    [searchTerm]
  )

  const handleCopy = useCallback((index: number, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    }).catch((err) => {
      console.error('Failed to copy text: ', err)
    })
  }, [])

  const toggleVisibility = useCallback(() => {
    setIsVisible((prev) => !prev)
  }, [])

  const RelationshipCard = useCallback(({ relationship, index }: { relationship: Relationship, index: number }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
      <div className="font-semibold text-lg text-gray-800 mb-3">{relationship.English}</div>
      <div className={`text-gray-600 mb-4 ${isVisible ? '' : 'select-none filter blur-sm'}`} aria-hidden={!isVisible}>
        {relationship.Bengali}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-300"
        onClick={() => handleCopy(index, relationship.English)}
        aria-label={`Copy ${relationship.English} relationship`}
      >
        {copiedIndex === index ? (
          <Check className="h-4 w-4 mr-2" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4 mr-2" aria-hidden="true" />
        )}
        {copiedIndex === index ? 'Copied!' : 'Copy'}
      </Button>
    </div>
  ), [copiedIndex, handleCopy, isVisible])

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" type='button' aria-label="View family relationships" className="bg-white text-gray-800 hover:bg-gray-50">
          <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
          View Relationships
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-xl">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-800">Family Relationships in English and Bengali</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row justify-between items-center my-6 gap-4">
          <div className="relative flex-1 w-full sm:w-auto">
            <Input
              type="text"
              placeholder="Search relationships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full bg-white text-gray-800 placeholder-gray-400 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              aria-label="Search relationships"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} aria-hidden="true" />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleVisibility}
            aria-label={isVisible ? "Hide Bengali text" : "Show Bengali text"}
            className="bg-white text-gray-800 hover:bg-gray-100"
          >
            {isVisible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </Button>
        </div>
        <div className="overflow-auto h-[calc(90vh-200px)] pr-4">
          {filteredRelationships.length > 0 ? (
            filteredRelationships.map((relationship, index) => (
              <RelationshipCard
                key={index}
                relationship={relationship}
                index={index}
              />
            ))
          ) : (
            <p className="text-gray-600 text-center">No relationships found matching your search.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
