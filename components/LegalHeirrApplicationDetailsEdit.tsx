import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Gender,
  LivingStatus,
  FamilyRelationship,
} from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Trash2, Edit } from "lucide-react";
import { WarishDetailProps, WarishApplicationProps } from "@/types";
import { capitalizeFirstLetter, formatText } from "@/utils/formatText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const getSerialNumber = (depth: number, index: number): string => {
  if (depth === 0) return `${index + 1}`;
  if (depth === 1) return String.fromCharCode(65 + index);
  return String.fromCharCode(97 + index);
};

const renderWarishDetails = (
  details: WarishDetailProps[],
  depth = 0,
  parentIndex = "",
  handleDelete: (id: string) => Promise<void>,
  handleUpdate: (id: string, updatedData: Partial<WarishDetailProps>) => Promise<void>
): React.ReactNode => {
  return details.map((detail, index) => {
    const currentIndex = parentIndex
      ? `${parentIndex}.${getSerialNumber(depth, index)}`
      : getSerialNumber(depth, index);

    return (
      <React.Fragment key={detail.id}>
        <TableRow className={depth % 2 === 0 ? "bg-gray-50" : "bg-white"}>
          <TableCell className="font-medium text-right w-[10%]">
            {currentIndex}
          </TableCell>
          <TableCell className="font-medium">
            <form action={async (formData) => {
              await handleUpdate(detail.id, { name: formData.get("name") as string });
            }}>
              <Input
                name="name"
                defaultValue={detail.name}
              />
              <Button type="submit" variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </form>
          </TableCell>
          <TableCell>
            <form action={async (formData) => {
              await handleUpdate(detail.id, { gender: formData.get("gender") as Gender });
            }}>
              <Input
                name="gender"
                defaultValue={detail.gender}
              />
              <Button type="submit" variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </form>
          </TableCell>
          <TableCell>
            <form action={async (formData) => {
              await handleUpdate(detail.id, { relation: formData.get("relation") as FamilyRelationship });
            }}>
              <Input
                name="relation"
                defaultValue={detail.relation}
              />
              <Button type="submit" variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </form>
          </TableCell>
          <TableCell>
            <form action={async (formData) => {
              await handleUpdate(detail.id, { livingStatus: formData.get("livingStatus") as LivingStatus });
            }}>
              <Input
                name="livingStatus"
                defaultValue={detail.livingStatus}
              />
              <Button type="submit" variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </form>
          </TableCell>
          <TableCell>
            <form action={async (formData) => {
              await handleUpdate(detail.id, { hasbandName: formData.get("hasbandName") as string });
            }}>
              <Input
                name="hasbandName"
                defaultValue={detail.hasbandName || ""}
              />
              <Button type="submit" variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </form>
          </TableCell>
          <TableCell>
            <form action={async () => await handleDelete(detail.id)}>
              <Button type="submit" variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </form>
          </TableCell>
        </TableRow>
        {detail.children &&
          detail.children.length > 0 &&
          renderWarishDetails(
            detail.children,
            depth + 1,
            currentIndex,
            handleDelete,
            handleUpdate
          )}
      </React.Fragment>
    );
  });
};

export default function LegalHeirrApplicationDetails({
  application,
  rootWarishDetails,
  onDelete,
  onUpdate,
}: {
  application: WarishApplicationProps;
  rootWarishDetails: WarishDetailProps[];
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, updatedData: Partial<WarishDetailProps>) => Promise<void>;
}) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Table of Legal Heirs</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[10%]">Serial No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Relation</TableHead>
                <TableHead>Living Status</TableHead>
                <TableHead>Husband Name</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderWarishDetails(
                rootWarishDetails,
                0,
                "",
                onDelete,
                onUpdate
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
