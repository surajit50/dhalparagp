
"use client"
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Building2, Calendar, ArrowRight, Info } from "lucide-react"

type Year = { id: string; yeardata: string }
type Village = { id: string; name: string; lgdcode?: string; jlno?: string }

interface Props {
  years: Year[]
  villages: Village[]
  onSelect: (selection: { year: string; villageId: string }) => void
}

export function VillageYearSelector({ years, villages, onSelect }: Props) {
  const [year, setYear] = useState("")
  const [villageId, setVillageId] = useState("")

  const selectedVillage = villages.find((v) => v.id === villageId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (year && villageId) {
      onSelect({ year, villageId })
    }
  }

  return (
    <div className="p-6">
      <Card className="max-w-2xl mx-auto border border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-center text-gray-800 flex flex-col items-center">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="h-7 w-7 text-blue-600" />
              <span>Select Village and Year</span>
            </div>
            <p className="text-base font-normal text-gray-600 mt-2">
              Choose a village and year to manage information
            </p>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-6">
              {/* Year Selector */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>Year *</span>
                </div>
                <Select value={year} onValueChange={setYear} required>
                  <SelectTrigger className="w-full h-12 px-4 text-base border border-gray-300 rounded-lg bg-white hover:bg-gray-50">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg shadow-lg border border-gray-200">
                    {Array.isArray(years) &&
                      years.map((y) => (
                        <SelectItem 
                          key={y.id} 
                          value={y.yeardata}
                          className="py-3 px-4 text-base hover:bg-blue-50"
                        >
                          {y.yeardata}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Village Selector */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  <span>Village *</span>
                </div>
                <Select value={villageId} onValueChange={setVillageId} required>
                  <SelectTrigger className="w-full h-12 px-4 text-base border border-gray-300 rounded-lg bg-white hover:bg-gray-50">
                    <SelectValue placeholder="Select Village" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                    {villages.map((v) => (
                      <SelectItem 
                        key={v.id} 
                        value={v.id}
                        className="py-3 px-4 text-base hover:bg-blue-50"
                      >
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Village Information Card */}
            {selectedVillage && (
              <Card className="bg-blue-50 border border-blue-200 rounded-xl">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Info className="h-4 w-4" />
                      <h3 className="font-medium">Village Details</h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className="bg-white text-blue-600 border border-blue-200 px-3 py-1"
                        >
                          LGD Code
                        </Badge>
                        <span className="font-medium text-gray-800">{selectedVillage.lgdcode || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className="bg-white text-blue-600 border border-blue-200 px-3 py-1"
                        >
                          JL No
                        </Badge>
                        <span className="font-medium text-gray-800">{selectedVillage.jlno || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button 
                type="submit" 
                className="px-8 py-6 text-base font-medium bg-blue-600 hover:bg-blue-700 transition-all"
                disabled={!year || !villageId}
              >
                <span className="flex items-center gap-2">
                  Continue to Village Information
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Button>
            </div>
            
            {/* Helper Text */}
            {(!year || !villageId) && (
              <p className="text-center text-gray-500 text-sm pt-2">
                Please select both a year and a village to continue
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
