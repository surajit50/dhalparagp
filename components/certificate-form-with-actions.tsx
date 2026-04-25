"use client";

import { useState, useActionState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Trash2,
  Users,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createCertificate } from "@/action/certificate-actions";
import type { CertificateFormInput } from "@/schema/family-lineage-certificate-schema";
import type { FamilyMember } from "@/types";

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

const initialFormData: CertificateFormInput = {
  applicantName: "",
  applicantPhone: "",
  applicantEmail: "",
  applicantAddress: "",
  ancestorName: "",
  casteCategory: "",
  village: "",
  postOffice: "",
  block: "",
  district: "",
  state: "",
  familyMembers: [],
};

export default function CertificateFormWithActions() {
  const [formData, setFormData] =
    useState<CertificateFormInput>(initialFormData);
  const [currentMember, setCurrentMember] = useState<Partial<FamilyMember>>({});
  const [selectedParent, setSelectedParent] = useState<
    FamilyMember | undefined
  >(undefined);
  const { toast } = useToast();

  // Server action states
  const [draftState, draftAction, isDraftPending] = useActionState(
    async (prevState: any, formData: CertificateFormInput) => {
      const result = await createCertificate(formData, true);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setFormData(initialFormData);
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
      return result;
    },
    null
  );

  const [submitState, submitAction, isSubmitPending] = useActionState(
    async (prevState: any, formData: CertificateFormInput) => {
      const result = await createCertificate(formData, false);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setFormData(initialFormData);
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
      return result;
    },
    null
  );

  // Organize family members into a tree structure
  const organizeIntoTree = (members: FamilyMember[]): FamilyMember[] => {
    const memberMap = new Map<string, FamilyMember>();
    const rootMembers: FamilyMember[] = [];

    // First pass: create map of all members
    members.forEach((member) => {
      if (member.id) {
        memberMap.set(member.id, { ...member, children: [] });
      }
    });

    // Second pass: organize into tree structure
    members.forEach((member) => {
      let currentMember: FamilyMember | undefined = undefined;
      if (member.id) {
        currentMember = memberMap.get(member.id);
      }
      if (member.parentId) {
        const parent = memberMap.get(member.parentId);
        if (parent && currentMember) {
          if (!parent.children) parent.children = [];
          parent.children.push(currentMember);
        }
      } else {
        if (currentMember) {
          rootMembers.push(currentMember);
        }
      }
    });

    return rootMembers;
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
      parentId: selectedParent?.id !== null ? selectedParent?.id : undefined,
      children: [],
    };

    setFormData((prev) => {
      const updatedMembers = [...prev.familyMembers, newMember].map((m) => ({
        ...m,
        parentId: m.parentId === null ? undefined : m.parentId,
      }));
      return {
        ...prev,
        familyMembers: updatedMembers,
      };
    });

    setCurrentMember({});
    setSelectedParent(undefined);
    toast({
      title: "Family Member Added",
      description: `${newMember.name} has been added to the family tree${
        selectedParent ? ` as child of ${selectedParent.name}` : ""
      }.`,
    });
  };

  // Recursively remove family member and all descendants
  const removeFamilyMember = (id: string) => {
    // Helper function to collect all IDs to remove
    const collectIdsToRemove = (
      id: string,
      members: FamilyMember[]
    ): string[] => {
      const ids = [id];
      const member = members.find((m) => m.id === id);
      if (member) {
        const children = members.filter((m) => m.parentId === id);
        children.forEach((child) => {
          if (child.id) {
            ids.push(...collectIdsToRemove(child.id, members));
          }
        });
      }
      return ids;
    };

    setFormData((prev) => {
      const idsToRemove = collectIdsToRemove(id, prev.familyMembers);
      const updatedMembers = prev.familyMembers.filter(
        (member) => !idsToRemove.includes(member.id as string)
      );
      return {
        ...prev,
        familyMembers: updatedMembers,
      };
    });

    // Clear selected parent if it was the removed member
    if (selectedParent?.id === id) {
      setSelectedParent(undefined);
    }
  };

  // Get organized tree structure of family members
  const getAllMembers = (): FamilyMember[] => {
    const validMembers = formData.familyMembers
      .filter((member) => member.id !== undefined)
      .map((member) => ({
        ...member,
        parentId: member.parentId === null ? undefined : member.parentId,
      })) as FamilyMember[];
    return organizeIntoTree(validMembers);
  };

  const validateForm = (): boolean => {
    const requiredFields = [
      "applicantName",
      "applicantPhone",
      "applicantAddress",
      "ancestorName",
      "casteCategory",
      "village",
      "postOffice",
      "block",
      "district",
      "state",
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof CertificateFormInput]) {
        toast({
          title: "Validation Error",
          description: `${field
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())} is required.`,
          variant: "destructive",
        });
        return false;
      }
    }

    if (formData.familyMembers.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one family member is required.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (isDraft: boolean) => {
    if (!isDraft && !validateForm()) {
      return;
    }

    if (isDraft) {
      draftAction(formData);
    } else {
      submitAction(formData);
    }
  };

  // Render family tree with proper hierarchy
  const renderFamilyTree = (members: FamilyMember[], level = 0) => {
    return (
      <div className="space-y-2" style={{ marginLeft: `${level * 20}px` }}>
        {members.map((member) => (
          <div key={member.id}>
            <div
              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedParent?.id === member.id
                  ? "border-blue-500 bg-blue-50"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedParent(member)}
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Badge variant="secondary">{member.relation}</Badge>
                    {member.age && <span>Age: {member.age}</span>}
                    {member.occupation && <span>• {member.occupation}</span>}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (member.id) {
                    removeFamilyMember(member.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {member.children && member.children.length > 0 && (
              <div className="mt-2">
                {renderFamilyTree(member.children, level + 1)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
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

      {/* Show errors */}
      {(draftState?.error || submitState?.error) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {draftState?.error || submitState?.error}
          </AlertDescription>
        </Alert>
      )}

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
                required
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
                required
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
              required
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
                required
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
                required
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
                required
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
                required
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
                required
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
                required
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
                required
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
            Add family members to build the family tree. Start with the ancestor
            and add descendants.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Family Member Form */}
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
                Add Member
              </Button>
              {selectedParent && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedParent(undefined)}
                >
                  Clear Parent Selection
                </Button>
              )}
            </div>
            {selectedParent && (
              <p className="text-sm text-blue-600 mt-2">
                Adding child to: <strong>{selectedParent.name}</strong> (
                {selectedParent.relation})
              </p>
            )}
          </div>

          {/* Family Tree Display */}
          {formData.familyMembers.length > 0 && (
            <div>
              <h4 className="font-medium mb-4">
                Family Tree ({formData.familyMembers.length} members)
              </h4>
              {renderFamilyTree(getAllMembers())}
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
              onClick={() => handleSubmit(true)}
              disabled={isDraftPending || isSubmitPending}
              className="flex-1"
            >
              {isDraftPending ? (
                <Clock className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isDraftPending || isSubmitPending}
              className="flex-1"
            >
              {isSubmitPending ? (
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
