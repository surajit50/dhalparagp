"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  addMember,
  getMemberList,
  updateMember,
  deleteMember,
  getMouzaList,
} from "@/action/villagemanage";
import { Button } from "@/components/ui/button";
import { UserPlus, List, Pencil, Trash2, ShieldCheck, Flag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MemberForm } from "@/components/village-forms/MemberForm";
import { VillagePageHeader } from "@/components/village/VillagePageHeader";
import { VillageDataTable } from "@/components/village/VillageDataTable";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function MemberPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [mouzas, setMouzas] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);

  const loadData = useCallback(async () => {
    const [memberData, mouzaData] = await Promise.all([
      getMemberList(),
      getMouzaList(),
    ]);
    setMembers(memberData);
    setMouzas(mouzaData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (Array.isArray(data[key])) {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });

    const result = await addMember(formData);
    setIsSubmitting(false);
    if (result.success) {
      toast.success(result.message);
      loadData();
    } else {
      toast.error(result.message);
    }
  };

  const onUpdate = async (data: any) => {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        if (Array.isArray(data[key])) {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      }
    });
    formData.append("id", editingMember.id);

    const result = await updateMember(formData);
    setIsSubmitting(false);
    if (result.success) {
      toast.success(result.message);
      loadData();
      setIsEditDialogOpen(false);
      setEditingMember(null);
    } else {
      toast.error(result.message);
    }
  };

  const handleEditClick = (member: any) => {
    setEditingMember(member);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member registration?"))
      return;
    const form = new FormData();
    form.append("id", id);
    const res = await deleteMember(form);
    if (res.success) {
      toast.success(res.message);
      loadData();
    } else {
      toast.error(res.message);
    }
  };

  const columns = [
    {
      header: "Member Identity",
      accessor: (item: any) => (
        <div className="flex flex-col pl-6">
          <span className="font-bold text-gray-900">
            {item.salutation} {item.firstName} {item.lastName}
          </span>
          <span className="text-xs text-gray-500 uppercase tracking-tighter">
            {item.profession || "Personnel"}
          </span>
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: (item: any) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{item.contactNo}</span>
          <span className="text-xs text-gray-400">{item.email}</span>
        </div>
      ),
    },
    {
      header: "Identification",
      accessor: (item: any) => (
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
              {item.aadhar.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3")}
            </span>
          </div>
          {item.politicalParty && (
            <div className="flex items-center space-x-1">
              <Flag className="h-3 w-3 text-purple-500" />
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-tighter">
                {item.politicalParty}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Assigned Areas",
      accessor: (item: any) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {item.mouzaIds && item.mouzaIds.length > 0 ? (
            item.mouzaIds.map((id: string) => {
              const mouza = mouzas.find((m) => m.id === id);
              return (
                <Badge key={id} variant="secondary" className="text-[10px] py-0 px-1 bg-orange-50 text-orange-700 border-orange-100">
                  {mouza?.name || "Unknown"}
                </Badge>
              );
            })
          ) : (
            <span className="text-[10px] text-gray-400">None assigned</span>
          )}
        </div>
      ),
    },
    {
      header: "Location",
      accessor: (item: any) => (
        <span className="text-sm text-gray-600 italic">
          {item.village}, {item.pin}
        </span>
      ),
    },
    {
      header: "Action",
      accessor: (item: any) => (
        <div className="flex items-center justify-end space-x-2 pr-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditClick(item)}
            className="hover:bg-purple-100 hover:text-purple-600 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(item.id)}
            className="hover:bg-red-100 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 space-y-10">
      <VillagePageHeader
        title="Personnel Management"
        description="Register and manage Gram Panchayat executive members and administrative personnel records."
        icon={UserPlus}
        gradientFrom="from-purple-600"
        gradientTo="to-orange-600"
      />

      <div className="space-y-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="shadow-2xl shadow-gray-200/50 border-none rounded-3xl bg-white overflow-hidden">
            <CardHeader className="border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white py-6 px-8">
              <div className="flex items-center space-x-3 text-purple-600">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-bold tracking-tight text-gray-800">
                  New Member Enrollment
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <MemberForm
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
                mouzas={mouzas}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-gray-500 font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <List className="h-4 w-4" />
              <span>{members.length} Registered Members</span>
            </div>
          </div>

          <VillageDataTable
            columns={columns}
            data={members}
            emptyMessage="No personnel records found. Start identifying GP members."
            emptyIcon={UserPlus}
          />
        </motion.div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto rounded-3xl border-none shadow-2xl">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Pencil className="h-5 w-5 text-purple-600" />
              </div>
              <span>Edit Member Enrollment Profile</span>
            </DialogTitle>
          </DialogHeader>
          <div className="pt-6">
            <MemberForm
              onSubmit={onUpdate}
              isSubmitting={isSubmitting}
              defaultValues={editingMember}
              isEditing={true}
              mouzas={mouzas}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
