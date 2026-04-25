"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  Upload,
  Save,
  Plus,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";

const meetingTypes = [
  {
    value: "UPASAMITY",
    label: "Upasamity",
    color: "bg-blue-100 text-blue-800",
  },
  { value: "GENERAL", label: "General", color: "bg-green-100 text-green-800" },
  { value: "ARTHO", label: "Artho", color: "bg-purple-100 text-purple-800" },
  {
    value: "SPECIAL_GRAM_SABHA",
    label: "Special Gram Sabha",
    color: "bg-orange-100 text-orange-800",
  },
  {
    value: "REGULAR_GRAM_SABHA",
    label: "Regular Gram Sabha",
    color: "bg-red-100 text-red-800",
  },
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const financialYears = ["2024-25", "2025-26", "2026-27", "2027-28", "2028-29"];

const upasamitySubtypes = [
  { value: "SIPLA_PARIKATHAMA", label: "Sipla Parikathama" },
  { value: "SIKHA_O_JANASANTHA", label: "Sikha o Janasantha" },
  { value: "NARI_O_SHISHU", label: "Nari o Shishu" },
  { value: "KRISHA_O_PANI_SAMPAD", label: "Krisha o Pani Sampad" },
];

const steps = [
  { id: "basic", title: "Basic Info", icon: Calendar },
  { id: "attendees", title: "Attendees", icon: Users },
  { id: "resolutions", title: "Resolutions", icon: FileText },
  { id: "documents", title: "Documents", icon: Upload },
];

export default function AddMeetingPage() {
  const [formData, setFormData] = useState({
    title: "",
    meetingType: "",
    upasamitySubtype: "",
    meetingDate: "",
    startTime: "",
    endTime: "",
    venue: "",
    agenda: "",
    description: "",
    financialYear: "",
    month: "",
  });

  const [attendees, setAttendees] = useState([
    { name: "", designation: "", village: "", phone: "", email: "" },
  ]);

  const [resolutions, setResolutions] = useState([
    {
      resolutionNumber: "",
      subject: "",
      description: "",
      decision: "",
      budgetAmount: "",
      implementationTimeline: "",
      responsiblePerson: "",
    },
  ]);

  const [documents, setDocuments] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "meetingType" && value !== "UPASAMITY") {
      setFormData((prev) => ({ ...prev, upasamitySubtype: "" }));
    }
  };

  const addAttendee = () => {
    setAttendees((prev) => [
      ...prev,
      { name: "", designation: "", village: "", phone: "", email: "" },
    ]);
  };

  const removeAttendee = (index: number) => {
    if (attendees.length > 1) {
      setAttendees((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateAttendee = (index: number, field: string, value: string) => {
    setAttendees((prev) =>
      prev.map((attendee, i) =>
        i === index ? { ...attendee, [field]: value } : attendee
      )
    );
  };

  const addResolution = () => {
    setResolutions((prev) => [
      ...prev,
      {
        resolutionNumber: "",
        subject: "",
        description: "",
        decision: "",
        budgetAmount: "",
        implementationTimeline: "",
        responsiblePerson: "",
      },
    ]);
  };

  const removeResolution = (index: number) => {
    if (resolutions.length > 1) {
      setResolutions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateResolution = (index: number, field: string, value: string) => {
    setResolutions((prev) =>
      prev.map((resolution, i) =>
        i === index ? { ...resolution, [field]: value } : resolution
      )
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      toast.success(`${files.length} file(s) selected`);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0: // Basic Info
        if (
          !formData.title ||
          !formData.meetingType ||
          (formData.meetingType === "UPASAMITY" &&
            !formData.upasamitySubtype) ||
          !formData.meetingDate ||
          !formData.startTime ||
          !formData.endTime ||
          !formData.venue ||
          !formData.agenda
        ) {
          toast.error("Please fill in all required fields");
          return false;
        }
        return true;
      case 1: // Attendees
        for (const attendee of attendees) {
          if (!attendee.name || !attendee.designation || !attendee.village) {
            toast.error("Please fill all required attendee fields");
            return false;
          }
        }
        return true;
      case 2: // Resolutions
        for (const resolution of resolutions) {
          if (
            !resolution.resolutionNumber ||
            !resolution.subject ||
            !resolution.description ||
            !resolution.decision
          ) {
            toast.error("Please fill all required resolution fields");
            return false;
          }
        }
        return true;
      default:
        return true;
    }
  };

  const goToNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const goToPrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCurrentStep()) {
      try {
        toast.success("Meeting created successfully!");
        // Reset form
        setFormData({
          title: "",
          meetingType: "",
          upasamitySubtype: "",
          meetingDate: "",
          startTime: "",
          endTime: "",
          venue: "",
          agenda: "",
          description: "",
          financialYear: "",
          month: "",
        });
        setAttendees([
          { name: "", designation: "", village: "", phone: "", email: "" },
        ]);
        setResolutions([
          {
            resolutionNumber: "",
            subject: "",
            description: "",
            decision: "",
            budgetAmount: "",
            implementationTimeline: "",
            responsiblePerson: "",
          },
        ]);
        setDocuments([]);
        setCurrentStep(0);
      } catch (error) {
        toast.error("Failed to create meeting");
      }
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur flex items-center justify-between py-4 mb-2 border-b">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-7 w-7 text-blue-600" />
            Add New Meeting
          </h1>
          <p className="text-gray-600 mt-1 text-base">
            Schedule and manage Gram Sabha meetings
          </p>
        </div>
        <Badge variant="outline" className="text-sm flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          Meeting Management
        </Badge>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === index;
          const isCompleted = currentStep > index;

          return (
            <div
              key={step.id}
              className={`flex-1 flex flex-col items-center relative ${
                index < steps.length - 1 ? "pr-8" : ""
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <Icon className="h-6 w-6" />
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  isActive
                    ? "text-blue-600 font-bold"
                    : isCompleted
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-6 left-full h-1 w-8 ${
                    isCompleted ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></div>
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Step 1: Basic Meeting Information */}
        {currentStep === 0 && (
          <Card className="bg-gray-50 shadow-none border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
                Basic Meeting Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Meeting Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter meeting title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meetingType">
                    Meeting Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.meetingType}
                    onValueChange={(value) =>
                      handleInputChange("meetingType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select meeting type" />
                    </SelectTrigger>
                    <SelectContent>
                      {meetingTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center">
                            <Badge className={type.color}>{type.label}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Upasamity Subtype Dropdown */}
                {formData.meetingType === "UPASAMITY" && (
                  <div className="space-y-2">
                    <Label htmlFor="upasamitySubtype">
                      Upasamity Subtype <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.upasamitySubtype}
                      onValueChange={(value) =>
                        handleInputChange("upasamitySubtype", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select upasamity subtype" />
                      </SelectTrigger>
                      <SelectContent>
                        {upasamitySubtypes.map((sub) => (
                          <SelectItem key={sub.value} value={sub.value}>
                            {sub.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="meetingDate">
                    Meeting Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="meetingDate"
                    type="date"
                    value={formData.meetingDate}
                    onChange={(e) =>
                      handleInputChange("meetingDate", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">
                    Start Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      handleInputChange("startTime", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">
                    End Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      handleInputChange("endTime", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">
                    Venue <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => handleInputChange("venue", e.target.value)}
                    placeholder="Enter meeting venue"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="financialYear">Financial Year</Label>
                  <Select
                    value={formData.financialYear}
                    onValueChange={(value) =>
                      handleInputChange("financialYear", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select financial year" />
                    </SelectTrigger>
                    <SelectContent>
                      {financialYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="month">Month</Label>
                  <Select
                    value={formData.month}
                    onValueChange={(value) => handleInputChange("month", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agenda">
                  Meeting Agenda <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="agenda"
                  value={formData.agenda}
                  onChange={(e) => handleInputChange("agenda", e.target.value)}
                  placeholder="Enter meeting agenda points"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Enter meeting description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Attendees */}
        {currentStep === 1 && (
          <Card className="bg-gray-50 shadow-none border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-green-600" />
                Meeting Attendees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {attendees.map((attendee, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-4 bg-white"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Attendee {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAttendee(index)}
                      disabled={attendees.length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={attendee.name}
                        onChange={(e) =>
                          updateAttendee(index, "name", e.target.value)
                        }
                        placeholder="Enter name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Designation <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={attendee.designation}
                        onChange={(e) =>
                          updateAttendee(index, "designation", e.target.value)
                        }
                        placeholder="Enter designation"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Village <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={attendee.village}
                        onChange={(e) =>
                          updateAttendee(index, "village", e.target.value)
                        }
                        placeholder="Enter village"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={attendee.phone}
                        onChange={(e) =>
                          updateAttendee(index, "phone", e.target.value)
                        }
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        value={attendee.email}
                        onChange={(e) =>
                          updateAttendee(index, "email", e.target.value)
                        }
                        placeholder="Enter email"
                        type="email"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addAttendee}
                className="w-full hover:bg-green-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Attendee
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Resolutions */}
        {currentStep === 2 && (
          <Card className="bg-gray-50 shadow-none border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-purple-600" />
                Meeting Resolutions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resolutions.map((resolution, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-4 bg-white"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Resolution {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeResolution(index)}
                      disabled={resolutions.length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Resolution Number{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={resolution.resolutionNumber}
                        onChange={(e) =>
                          updateResolution(
                            index,
                            "resolutionNumber",
                            e.target.value
                          )
                        }
                        placeholder="e.g., RES/2025/001"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Subject <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={resolution.subject}
                        onChange={(e) =>
                          updateResolution(index, "subject", e.target.value)
                        }
                        placeholder="Enter resolution subject"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      value={resolution.description}
                      onChange={(e) =>
                        updateResolution(index, "description", e.target.value)
                      }
                      placeholder="Enter resolution description"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Decision <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      value={resolution.decision}
                      onChange={(e) =>
                        updateResolution(index, "decision", e.target.value)
                      }
                      placeholder="Enter decision taken"
                      rows={2}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Budget Amount (₹)</Label>
                      <Input
                        value={resolution.budgetAmount}
                        onChange={(e) =>
                          updateResolution(
                            index,
                            "budgetAmount",
                            e.target.value
                          )
                        }
                        placeholder="Enter amount"
                        type="number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Implementation Timeline</Label>
                      <Input
                        value={resolution.implementationTimeline}
                        onChange={(e) =>
                          updateResolution(
                            index,
                            "implementationTimeline",
                            e.target.value
                          )
                        }
                        placeholder="e.g., 3 months"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Responsible Person</Label>
                      <Input
                        value={resolution.responsiblePerson}
                        onChange={(e) =>
                          updateResolution(
                            index,
                            "responsiblePerson",
                            e.target.value
                          )
                        }
                        placeholder="Enter responsible person"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addResolution}
                className="w-full hover:bg-purple-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Resolution
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Document Upload */}
        {currentStep === 3 && (
          <Card className="bg-gray-50 shadow-none border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="h-5 w-5 text-orange-600" />
                Meeting Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="documents">Upload Documents</Label>
                <Input
                  id="documents"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <p className="text-sm text-gray-500">
                  Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG (Max 10MB
                  each)
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={goToPrevStep}
            disabled={currentStep === 0}
            className={currentStep === 0 ? "invisible" : ""}
          >
            Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              onClick={goToNextStep}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Next
            </Button>
          ) : (
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="hover:bg-gray-100"
              >
                Save as Draft
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="mr-2 h-4 w-4" />
                Create Meeting
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
