"use client";

import React, { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Edit, Star } from "lucide-react";
import { upsertSignatureSetting } from "@/action/nrega/master-data-actions";
import { NregaSignatureSetting } from "@prisma/client";

export default function SettingsPageClient({ initialSettings }: { initialSettings: NregaSignatureSetting[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [formData, setFormData] = useState({
    designation: "",
    name: "",
    block: "",
    isDefault: false,
  });

  const handleOpenForm = (setting?: NregaSignatureSetting) => {
    if (setting) {
      setEditingId(setting.id);
      setFormData({
        designation: setting.designation,
        name: setting.name || "",
        block: setting.block || "",
        isDefault: setting.isDefault,
      });
    } else {
      setEditingId(null);
      setFormData({
        designation: "",
        name: "",
        block: "",
        isDefault: false,
      });
    }
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!formData.designation) {
      toast.error("Designation is required");
      return;
    }

    startTransition(async () => {
      try {
        const result = await upsertSignatureSetting(formData, editingId || undefined);
        if (result.success) {
          toast.success(result.message);
          setIsFormOpen(false);
          router.refresh();
        } else {
          toast.error(result.message);
        }
      } catch {
        toast.error("An error occurred");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure default values and signature settings for certificates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Signature Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg">Signature Settings</CardTitle>
              <CardDescription>
                Configure the designations that appear on certificates.
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenForm()} size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            {isFormOpen && (
              <div className="mb-6 p-4 border rounded-md bg-muted/30 space-y-4">
                <h4 className="font-semibold text-sm">{editingId ? "Edit" : "Add"} Signature Authority</h4>
                <div className="space-y-3">
                  <div>
                    <Label>Designation *</Label>
                    <Input 
                      value={formData.designation}
                      onChange={(e) => setFormData({...formData, designation: e.target.value})}
                      placeholder="e.g. Block Development Officer"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Name (Optional)</Label>
                      <Input 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Block (Optional)</Label>
                      <Input 
                        value={formData.block}
                        onChange={(e) => setFormData({...formData, block: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch 
                      id="default" 
                      checked={formData.isDefault}
                      onCheckedChange={(checked) => setFormData({...formData, isDefault: checked})}
                    />
                    <Label htmlFor="default">Set as Default</Label>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleSave} disabled={isPending}>
                      {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {initialSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{setting.designation}</h4>
                      {setting.isDefault && (
                        <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold">
                          <Star className="h-3 w-3" /> Default
                        </span>
                      )}
                    </div>
                    {(setting.name || setting.block) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {setting.name} {setting.name && setting.block && " | "} {setting.block}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleOpenForm(setting)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {initialSettings.length === 0 && !isFormOpen && (
                <p className="text-sm text-muted-foreground text-center py-4">No signature settings configured.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
