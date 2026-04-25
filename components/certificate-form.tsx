"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Plus,
  Trash2,
  Users,
  FileText,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { submitCertificate } from "@/action/submit-certificate";

type FamilyMember = {
  id: string;
  name: string;
  relation: string;
  age?: number;
  occupation?: string;
  children?: FamilyMember[];
};

type CertificateFormData = {
  ancestorName: string;
  casteCategory: string;
  village: string;
  postOffice: string;
  block: string;
  district: string;
  state: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  applicantAddress: string;
  familyMembers: FamilyMember[];
};

const initialFormData: CertificateFormData = {
  ancestorName: "",
  casteCategory: "",
  village: "",
  postOffice: "",
  block: "",
  district: "",
  state: "",
  applicantName: "",
  applicantPhone: "",
  applicantEmail: "",
  applicantAddress: "",
  familyMembers: [],
};

const relationOptions = [
  "Ancestor",
  "Father",
  "Mother",
  "Son",
  "Daughter",
  "Grandfather",
  "Grandmother",
  "Great Grandfather",
  "Great Grandmother",
  "Brother",
  "Sister",
  "Uncle",
  "Aunt",
  "Nephew",
  "Niece",
  "Cousin",
  "Son-in-law",
  "Daughter-in-law",
  "Father-in-law",
  "Mother-in-law",
  "Brother-in-law",
  "Sister-in-law",
  "Grandson",
  "Granddaughter",
  "Great Grandson",
  "Great Granddaughter",
  "Step Father",
  "Step Mother",
  "Step Son",
  "Step Daughter",
  "Half Brother",
  "Half Sister",
];

export default function CertificateForm() {
  const [formData, setFormData] =
    useState<CertificateFormData>(initialFormData);
  const [currentMember, setCurrentMember] = useState<Partial<FamilyMember>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [selectedParent, setSelectedParent] = useState<FamilyMember | null>(
    null
  );

  const addChildToParent = () => {
    if (!currentMember.name || !currentMember.relation || !selectedParent) {
      toast({
        title: "Missing Information",
        description: "Please provide name and relation for the family member.",
        variant: "destructive",
      });
      return;
    }

    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: currentMember.name,
      relation: currentMember.relation,
      age: currentMember.age,
      occupation: currentMember.occupation,
      children: [],
    };

    const addChildRecursively = (members: FamilyMember[]): FamilyMember[] => {
      return members.map((member) => {
        if (member.id === selectedParent.id) {
          return {
            ...member,
            children: [...(member.children || []), newMember],
          };
        }
        if (member.children && member.children.length > 0) {
          return {
            ...member,
            children: addChildRecursively(member.children),
          };
        }
        return member;
      });
    };

    setFormData((prev) => ({
      ...prev,
      familyMembers: addChildRecursively(prev.familyMembers),
    }));

    setCurrentMember({});
    setSelectedParent(null);
    toast({
      title: "Child Added",
      description: `${newMember.name} has been added as a child of ${selectedParent.name}.`,
    });
  };

  const removeFamilyMemberById = (id: string) => {
    const removeMemberRecursively = (
      members: FamilyMember[]
    ): FamilyMember[] => {
      return members
        .filter((member) => member.id !== id)
        .map((member) => ({
          ...member,
          children: member.children
            ? removeMemberRecursively(member.children)
            : [],
        }));
    };

    setFormData((prev) => ({
      ...prev,
      familyMembers: removeMemberRecursively(prev.familyMembers),
    }));

    if (selectedParent?.id === id) {
      setSelectedParent(null);
    }

    toast({
      title: "Member Removed",
      description: "Family member and all their descendants have been removed.",
    });
  };

  const getAllMembers = (members: FamilyMember[]): FamilyMember[] => {
    const allMembers: FamilyMember[] = [];

    const collectMembers = (memberList: FamilyMember[]) => {
      memberList.forEach((member) => {
        allMembers.push(member);
        if (member.children && member.children.length > 0) {
          collectMembers(member.children);
        }
      });
    };

    collectMembers(members);
    return allMembers;
  };

  const getTotalMemberCount = () => {
    return getAllMembers(formData.familyMembers).length;
  };

  const renderInteractiveFamilyTree = (members: FamilyMember[], level = 0) => {
    return (
      <div className={level === 0 ? "font-mono text-sm" : ""}>
        {members.map((member, index) => {
          const isLastChild = index === members.length - 1;
          const hasChildren = member.children && member.children.length > 0;

          return (
            <div key={member.id} className="relative">
              <div className="flex items-center group">
                {/* Tree lines */}
                <div className="flex items-center">
                  {level > 0 && (
                    <>
                      <span className="text-gray-300 select-none">
                        {isLastChild ? "└── " : "├── "}
                      </span>
                    </>
                  )}

                  {/* Member card */}
                  <div
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                      selectedParent?.id === member.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedParent(member)}
                  >
                    <div className="flex-1">
                      <span className="font-semibold text-gray-800 text-sm">
                        {member.name}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {member.relation}
                        </Badge>
                        {member.age && (
                          <span className="text-xs text-gray-600">
                            Age: {member.age}
                          </span>
                        )}
                      </div>
                      {member.occupation && (
                        <p className="text-xs text-gray-600 mt-1">
                          {member.occupation}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedParent(member);
                        }}
                        className="h-6 w-6 p-0"
                        title="Add child"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFamilyMemberById(member.id);
                        }}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        title="Remove member"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Children count indicator */}
                    {hasChildren && (
                      <Badge variant="outline" className="text-xs">
                        {member.children!.length} child
                        {member.children!.length !== 1 ? "ren" : ""}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Render children */}
              {hasChildren && (
                <div className={`ml-${level === 0 ? "0" : "6"} mt-2`}>
                  {renderInteractiveFamilyTree(member.children!, level + 1)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const addFamilyMember = () => {
    if (!currentMember.name || !currentMember.relation) {
      toast({
        title: "Missing Information",
        description: "Please provide name and relation for the family member.",
        variant: "destructive",
      });
      return;
    }

    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: currentMember.name,
      relation: currentMember.relation,
      age: currentMember.age,
      occupation: currentMember.occupation,
      children: [],
    };

    setFormData((prev) => ({
      ...prev,
      familyMembers: [...prev.familyMembers, newMember],
    }));

    setCurrentMember({});
    toast({
      title: "Family Member Added",
      description: `${newMember.name} has been added to the family tree.`,
    });
  };

  const removeFamilyMember = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((member) => member.id !== id),
    }));
  };

  // Ensure all family members have children as an array (not undefined)
  const normalizeFamilyMembers = (members: FamilyMember[]): any[] => {
    return members.map((member) => ({
      ...member,
      children: member.children ? normalizeFamilyMembers(member.children) : [],
    }));
  };

  const validateFamilyMembers = (members: FamilyMember[]): boolean => {
    for (const member of members) {
      if (!member.name || !member.relation) {
        return false;
      }
      if (member.children && member.children.length > 0) {
        if (!validateFamilyMembers(member.children)) {
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (action: "draft" | "submit") => {
    // Ensure all family members have children as an array
    const normalizedFormData = {
      ...formData,
      familyMembers: normalizeFamilyMembers(formData.familyMembers),
    };
    const result = await submitCertificate(normalizedFormData, action);

    if (result.success) {
      toast({
        title: "Success",
        description: `Application submitted successfully. Certificate ID: ${result.certificateId}`,
      });
      // Handle success (e.g., redirect or reset form)
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Family Lineage Certificate Application
          </CardTitle>
          <CardDescription>
            Fill in the details to apply for a family lineage certificate. All
            fields marked with * are required.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Applicant Information */}
      <Card>
        <CardHeader>
          <CardTitle>Applicant Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="applicantName">Full Name *</Label>
              <Input
                id="applicantName"
                value={formData.applicantName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    applicantName: e.target.value,
                  }))
                }
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="applicantPhone">Phone Number *</Label>
              <Input
                id="applicantPhone"
                value={formData.applicantPhone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    applicantPhone: e.target.value,
                  }))
                }
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <Label htmlFor="applicantEmail">Email Address</Label>
              <Input
                id="applicantEmail"
                type="email"
                value={formData.applicantEmail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    applicantEmail: e.target.value,
                  }))
                }
                placeholder="Enter your email address"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="applicantAddress">Address *</Label>
            <Textarea
              id="applicantAddress"
              value={formData.applicantAddress}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  applicantAddress: e.target.value,
                }))
              }
              placeholder="Enter your complete address"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Ancestor Information */}
      <Card>
        <CardHeader>
          <CardTitle>Ancestor Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ancestorName">Ancestor Name *</Label>
              <Input
                id="ancestorName"
                value={formData.ancestorName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ancestorName: e.target.value,
                  }))
                }
                placeholder="Enter ancestor's name"
              />
            </div>
            <div>
              <Label htmlFor="casteCategory">Caste Category *</Label>
              <Input
                id="casteCategory"
                value={formData.casteCategory}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    casteCategory: e.target.value,
                  }))
                }
                placeholder="Enter caste category"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle>Address Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="village">Village *</Label>
              <Input
                id="village"
                value={formData.village}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, village: e.target.value }))
                }
                placeholder="Enter village name"
              />
            </div>
            <div>
              <Label htmlFor="postOffice">Post Office *</Label>
              <Input
                id="postOffice"
                value={formData.postOffice}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    postOffice: e.target.value,
                  }))
                }
                placeholder="Enter post office"
              />
            </div>
            <div>
              <Label htmlFor="block">Block *</Label>
              <Input
                id="block"
                value={formData.block}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, block: e.target.value }))
                }
                placeholder="Enter block name"
              />
            </div>
            <div>
              <Label htmlFor="district">District *</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, district: e.target.value }))
                }
                placeholder="Enter district name"
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, state: e.target.value }))
                }
                placeholder="Enter state name"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Family Tree */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Family Tree Builder
          </CardTitle>
          <CardDescription>
            Build a comprehensive family tree with multiple generations. Click
            on any member to add their children.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Root Member Form */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-4">Add Family Member</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="memberName">Name *</Label>
                <Input
                  id="memberName"
                  value={currentMember.name || ""}
                  onChange={(e) =>
                    setCurrentMember((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter name"
                />
              </div>
              <div>
                <Label htmlFor="memberRelation">Relation *</Label>
                <Select
                  value={currentMember.relation || ""}
                  onValueChange={(value) =>
                    setCurrentMember((prev) => ({ ...prev, relation: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relation" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationOptions.map((relation) => (
                      <SelectItem key={relation} value={relation}>
                        {relation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="memberAge">Age</Label>
                <Input
                  id="memberAge"
                  type="number"
                  value={currentMember.age || ""}
                  onChange={(e) =>
                    setCurrentMember((prev) => ({
                      ...prev,
                      age: Number.parseInt(e.target.value) || undefined,
                    }))
                  }
                  placeholder="Enter age"
                />
              </div>
              <div>
                <Label htmlFor="memberOccupation">Occupation</Label>
                <Input
                  id="memberOccupation"
                  value={currentMember.occupation || ""}
                  onChange={(e) =>
                    setCurrentMember((prev) => ({
                      ...prev,
                      occupation: e.target.value,
                    }))
                  }
                  placeholder="Enter occupation"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={addFamilyMember}>
                <Plus className="h-4 w-4 mr-2" />
                Add as Root Member
              </Button>
              {selectedParent && (
                <Button onClick={addChildToParent} variant="secondary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add as Child of {selectedParent.name}
                </Button>
              )}
            </div>
            {selectedParent && (
              <p className="text-sm text-blue-600 mt-2">
                Adding child to: <strong>{selectedParent.name}</strong> (
                {selectedParent.relation})
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedParent(null)}
                  className="ml-2 h-6 px-2"
                >
                  Cancel
                </Button>
              </p>
            )}
          </div>

          {/* Interactive Family Tree Display */}
          {formData.familyMembers.length > 0 && (
            <div>
              <h4 className="font-medium mb-4">Family Tree Structure</h4>
              <div className="border rounded-lg p-4 bg-white">
                {renderInteractiveFamilyTree(formData.familyMembers)}
              </div>
            </div>
          )}

          {/* Family Members Summary */}
          {formData.familyMembers.length > 0 && (
            <div>
              <h4 className="font-medium mb-4">
                All Family Members ({getTotalMemberCount()})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {getAllMembers(formData.familyMembers).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Badge variant="secondary" className="text-xs">
                            {member.relation}
                          </Badge>
                          {member.age && <span>Age: {member.age}</span>}
                          {member.occupation && (
                            <span>• {member.occupation}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedParent(member)}
                        className="h-8 px-2"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFamilyMemberById(member.id)}
                        className="h-8 px-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              onClick={() => handleSubmit("draft")}
              disabled={isSubmitting}
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSubmit("submit")}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <Clock className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Submit Application
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            After submission, your application will go through field enquiry and
            approval process. The certificate will be valid for 6 months from
            the date of issue.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
