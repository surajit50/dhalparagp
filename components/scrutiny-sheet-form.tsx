import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface CriteriaItem {
  name: string
  maxScore: number
  actualScore: number
}

export default function ScrutinySheetForm() {
  const [tenderDetails, setTenderDetails] = useState({
    tenderNumber: '',
    projectName: '',
    bidderName: '',
    evaluationDate: ''
  })

  const [criteria, setCriteria] = useState<CriteriaItem[]>([
    { name: 'Technical Capability', maxScore: 30, actualScore: 0 },
    { name: 'Financial Stability', maxScore: 25, actualScore: 0 },
    { name: 'Past Experience', maxScore: 20, actualScore: 0 },
    { name: 'Proposed Methodology', maxScore: 15, actualScore: 0 },
    { name: 'Quality Assurance', maxScore: 10, actualScore: 0 }
  ])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTenderDetails(prev => ({ ...prev, [name]: value }))
  }

  const handleScoreChange = (index: number, value: number) => {
    const newCriteria = [...criteria]
    newCriteria[index].actualScore = Math.min(value, newCriteria[index].maxScore)
    setCriteria(newCriteria)
  }

  const calculateTotalScore = () => {
    return criteria.reduce((total, item) => total + item.actualScore, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Tender Details:', tenderDetails)
    console.log('Evaluation Criteria:', criteria)
    console.log('Total Score:', calculateTotalScore())
    // Here you would typically send this data to your backend
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tenderNumber">Tender Number</Label>
          <Input
            id="tenderNumber"
            name="tenderNumber"
            value={tenderDetails.tenderNumber}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="projectName">Project Name</Label>
          <Input
            id="projectName"
            name="projectName"
            value={tenderDetails.projectName}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bidderName">Bidder Name</Label>
          <Input
            id="bidderName"
            name="bidderName"
            value={tenderDetails.bidderName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="evaluationDate">Evaluation Date</Label>
          <Input
            id="evaluationDate"
            name="evaluationDate"
            type="date"
            value={tenderDetails.evaluationDate}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Criteria</TableHead>
            <TableHead>Max Score</TableHead>
            <TableHead>Actual Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {criteria.map((item, index) => (
            <TableRow key={item.name}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.maxScore}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="0"
                  max={item.maxScore}
                  value={item.actualScore}
                  onChange={(e) => handleScoreChange(index, parseInt(e.target.value))}
                  required
                />
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={2} className="font-bold">Total Score</TableCell>
            <TableCell className="font-bold">{calculateTotalScore()}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Button type="submit">Submit Evaluation</Button>
    </form>
  )
}