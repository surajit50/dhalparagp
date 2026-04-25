"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText, User, Calendar, MapPin, Phone, AlertCircle } from "lucide-react";

export function DeathCertificateForm() {
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchType, setSearchType] = useState("name");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);

        // Simulate API call
        setTimeout(() => {
            setSearchResults([
                {
                    id: "DC001",
                    name: "Rajesh Kumar",
                    dateOfDeath: "2023-12-15",
                    placeOfDeath: "Village Dhalpara",
                    causeOfDeath: "Natural causes",
                    registrationNumber: "DC/2023/001",
                    status: "Verified",
                    issueDate: "2024-01-10",
                    informantName: "Rahul Kumar",
                    informantRelation: "Son"
                }
            ]);
            setIsSearching(false);
        }, 1000);
    };

    return (
        <div className="space-y-6">
            {/* Search Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search Death Certificate
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="searchType">Search By</Label>
                                <Select value={searchType} onValueChange={setSearchType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name">Deceased Name</SelectItem>
                                        <SelectItem value="registration">Registration Number</SelectItem>
                                        <SelectItem value="date">Date of Death</SelectItem>
                                        <SelectItem value="informant">Informant Name</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="searchValue">Search Value</Label>
                                <Input
                                    id="searchValue"
                                    placeholder={
                                        searchType === "name" ? "Enter deceased person's name" :
                                            searchType === "registration" ? "Enter registration number" :
                                                searchType === "date" ? "Enter date of death" :
                                                    "Enter informant's name"
                                    }
                                    type={searchType === "date" ? "date" : "text"}
                                />
                            </div>

                            <div className="flex items-end">
                                <Button type="submit" disabled={isSearching} className="w-full">
                                    {isSearching ? "Searching..." : "Search"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Search Results
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {searchResults.map((result) => (
                                <div key={result.id} className="border rounded-lg p-4 bg-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Deceased Name</Label>
                                            <p className="text-lg font-semibold">{result.name}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Date of Death</Label>
                                            <p>{result.dateOfDeath}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Place of Death</Label>
                                            <p>{result.placeOfDeath}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Cause of Death</Label>
                                            <p>{result.causeOfDeath}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Registration Number</Label>
                                            <p className="font-mono">{result.registrationNumber}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Status</Label>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${result.status === "Verified" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                                }`}>
                                                {result.status}
                                            </span>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Issue Date</Label>
                                            <p>{result.issueDate}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Informant Name</Label>
                                            <p>{result.informantName}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Informant Relation</Label>
                                            <p>{result.informantRelation}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t">
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">
                                                <FileText className="h-4 w-4 mr-2" />
                                                View Details
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <User className="h-4 w-4 mr-2" />
                                                Verify Identity
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Manual Verification Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Manual Verification Form
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="applicantName">Applicant Name</Label>
                                <Input id="applicantName" placeholder="Enter applicant's full name" />
                            </div>

                            <div>
                                <Label htmlFor="applicantPhone">Phone Number</Label>
                                <Input id="applicantPhone" placeholder="Enter phone number" type="tel" />
                            </div>

                            <div>
                                <Label htmlFor="deceasedName">Deceased Person&apos;s Name</Label>
                                <Input id="deceasedName" placeholder="Enter deceased person's full name" />
                            </div>

                            <div>
                                <Label htmlFor="dateOfDeath">Date of Death</Label>
                                <Input id="dateOfDeath" type="date" />
                            </div>

                            <div>
                                <Label htmlFor="placeOfDeath">Place of Death</Label>
                                <Input id="placeOfDeath" placeholder="Enter place of death" />
                            </div>

                            <div>
                                <Label htmlFor="causeOfDeath">Cause of Death</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select cause of death" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="natural">Natural causes</SelectItem>
                                        <SelectItem value="accident">Accident</SelectItem>
                                        <SelectItem value="illness">Illness</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="registrationNumber">Registration Number</Label>
                                <Input id="registrationNumber" placeholder="Enter registration number if available" />
                            </div>

                            <div>
                                <Label htmlFor="informantName">Informant Name</Label>
                                <Input id="informantName" placeholder="Enter informant's name" />
                            </div>

                            <div>
                                <Label htmlFor="informantRelation">Informant Relation</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select relation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="son">Son</SelectItem>
                                        <SelectItem value="daughter">Daughter</SelectItem>
                                        <SelectItem value="spouse">Spouse</SelectItem>
                                        <SelectItem value="father">Father</SelectItem>
                                        <SelectItem value="mother">Mother</SelectItem>
                                        <SelectItem value="brother">Brother</SelectItem>
                                        <SelectItem value="sister">Sister</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="verificationNotes">Verification Notes</Label>
                            <Textarea
                                id="verificationNotes"
                                placeholder="Enter any additional verification notes or findings"
                                rows={4}
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" className="flex-1">
                                Submit Verification Report
                            </Button>
                            <Button type="button" variant="outline" className="flex-1">
                                Clear Form
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
} 