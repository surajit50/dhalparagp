"use client"
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FaSchool, FaSearch } from "react-icons/fa"

// Mock data for schools
const schoolsData = [
  { id: 1, name: "Gram Panchayat Primary School", students: 120, teachers: 5, performance: "Good" },
  { id: 2, name: "Village High School", students: 250, teachers: 10, performance: "Excellent" },
  { id: 3, name: "Rural Middle School", students: 180, teachers: 7, performance: "Average" },
  { id: 4, name: "Panchayat Secondary School", students: 300, teachers: 15, performance: "Good" },
  { id: 5, name: "Community Elementary School", students: 100, teachers: 4, performance: "Needs Improvement" },
]

export default function SchoolManagement() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredSchools = schoolsData.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalStudents = schoolsData.reduce((sum, school) => sum + school.students, 0)
  const totalTeachers = schoolsData.reduce((sum, school) => sum + school.teachers, 0)

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-500 mb-6">Gram Panchayat School Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FaSchool className="mr-2 text-blue-500" />
              Total Schools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{schoolsData.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalStudents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalTeachers}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 relative">
        <Input
          type="text"
          placeholder="Search schools..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>School Records</CardTitle>
          <CardDescription>Comprehensive list of schools in the Gram Panchayat</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School Name</TableHead>
                <TableHead>Number of Students</TableHead>
                <TableHead>Number of Teachers</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell className="font-medium">{school.name}</TableCell>
                  <TableCell>{school.students}</TableCell>
                  <TableCell>{school.teachers}</TableCell>
                  <TableCell>{school.performance}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
