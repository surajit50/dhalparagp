"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText, User, Calendar, MapPin, Phone, Mail, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function BirthCertificateForm() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState("name");
  const [searchValue, setSearchValue] = useState("");
  const [formData, setFormData] = useState({
    applicantName: "",
    applicantPhone: "",
    childName: "",
    dateOfBirth: "",
    fatherName: "",
    motherName: "",
    placeOfBirth: "",
    registrationNumber: "",
    verificationNotes: ""
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      setSearchResults([
        {
          id: "BC001",
          name: "Rahul Kumar",
          fatherName: "Rajesh Kumar",
          motherName: "Sunita Devi",
          dateOfBirth: "1995-03-15",
          placeOfBirth: "Village Dhalpara",
          registrationNumber: "BC/2023/001",
          status: "Verified",
          issueDate: "2023-04-20"
        }
      ]);
      setIsSearching(false);
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Verification Report:", formData);
    // Here you would typically submit to an API
    alert("Verification report submitted successfully!");
  };

  const clearForm = () => {
    setFormData({
      applicantName: "",
      applicantPhone: "",
      childName: "",
      dateOfBirth: "",
      fatherName: "",
      motherName: "",
      placeOfBirth: "",
      registrationNumber: "",
      verificationNotes: ""
    });
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Birth Certificate
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
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="registration">Registration Number</SelectItem>
                    <SelectItem value="father">Father&apos;s Name</SelectItem>
                    <SelectItem value="date">Date of Birth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="searchValue">Search Value</Label>
                <Input
                  id="searchValue"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={
                    searchType === "name" ? "Enter full name" :
                    searchType === "registration" ? "Enter registration number" :
                    searchType === "father" ? "Enter father's name" :
                    "Enter date (YYYY-MM-DD)"
                  }
                  type={searchType === "date" ? "date" : "text"}
                />
              </div>
              
              <div className="flex items-end">
                <Button type="submit" disabled={isSearching || !searchValue.trim()} className="w-full">
                  {isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
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
                      <Label className="text-sm font-medium text-gray-600">Name</Label>
                      <p className="text-lg font-semibold">{result.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Father&apos;s Name</Label>
                      <p>{result.fatherName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Mother&apos;s Name</Label>
                      <p>{result.motherName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Date of Birth</Label>
                      <p>{result.dateOfBirth}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Place of Birth</Label>
                      <p>{result.placeOfBirth}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Registration Number</Label>
                      <p className="font-mono">{result.registrationNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.status === "Verified" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {result.status}
                      </span>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Issue Date</Label>
                      <p>{result.issueDate}</p>
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="applicantName">Applicant Name</Label>
                <Input 
                  id="applicantName" 
                  value={formData.applicantName}
                  onChange={(e) => handleInputChange("applicantName", e.target.value)}
                  placeholder="Enter applicant's full name" 
                />
              </div>
              
              <div>
                <Label htmlFor="applicantPhone">Phone Number</Label>
                <Input 
                  id="applicantPhone" 
                  value={formData.applicantPhone}
                  onChange={(e) => handleInputChange("applicantPhone", e.target.value)}
                  placeholder="Enter phone number" 
                  type="tel" 
                />
              </div>
              
              <div>
                <Label htmlFor="childName">Child&apos;s Name</Label>
                <Input 
                  id="childName" 
                  value={formData.childName}
                  onChange={(e) => handleInputChange("childName", e.target.value)}
                  placeholder="Enter child's full name" 
                />
              </div>
              
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input 
                  id="dateOfBirth" 
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  type="date" 
                />
              </div>
              
              <div>
                <Label htmlFor="fatherName">Father&apos;s Name</Label>
                <Input 
                  id="fatherName" 
                  value={formData.fatherName}
                  onChange={(e) => handleInputChange("fatherName", e.target.value)}
                  placeholder="Enter father's full name" 
                />
              </div>
              
              <div>
                <Label htmlFor="motherName">Mother&apos;s Name</Label>
                <Input 
                  id="motherName" 
                  value={formData.motherName}
                  onChange={(e) => handleInputChange("motherName", e.target.value)}
                  placeholder="Enter mother's full name" 
                />
              </div>
              
              <div>
                <Label htmlFor="placeOfBirth">Place of Birth</Label>
                <Input 
                  id="placeOfBirth" 
                  value={formData.placeOfBirth}
                  onChange={(e) => handleInputChange("placeOfBirth", e.target.value)}
                  placeholder="Enter place of birth" 
                />
              </div>
              
              <div>
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input 
                  id="registrationNumber" 
                  value={formData.registrationNumber}
                  onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                  placeholder="Enter registration number if available" 
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="verificationNotes">Verification Notes</Label>
              <Textarea 
                id="verificationNotes" 
                value={formData.verificationNotes}
                onChange={(e) => handleInputChange("verificationNotes", e.target.value)}
                placeholder="Enter any additional verification notes or findings"
                rows={4}
              />
            </div>
            
            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                Submit Verification Report
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={clearForm}>
                Clear Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 