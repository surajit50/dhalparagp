"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Eye,
  Search,
  Paperclip,
  File,
  Download,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface Email {
  id: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  content: string;
  from: string;
  status: "DRAFT";
  createdAt: string;
  attachments: {
    fileName: string;
    fileUrl: string;
    size?: number;
  }[];
}

const DraftsPage = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchEmails();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      // Adjust API endpoint if needed
      const response = await fetch("/api/email/drafts");
      if (!response.ok) throw new Error("Failed to fetch emails");
      const data = await response.json();
      setEmails(data);
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshEmails = async () => {
    setRefreshing(true);
    await fetchEmails();
    setRefreshing(false);
  };

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.from.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredEmails.length / itemsPerPage);
  const paginatedEmails = filteredEmails.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewEmail = (email: Email) => {
    setSelectedEmail(email);
    setIsDialogOpen(true);
  };

  const handleDownloadAttachments = (attachments: Email["attachments"]) => {
    attachments.forEach((attachment) => {
      window.open(attachment.fileUrl, "_blank");
    });
  };

  const ACTIONS = [
    {
      label: "Refresh",
      icon: RefreshCcw,
      onClick: refreshEmails,
      disabled: refreshing,
    },
    {
      label: "Edit",
      icon: Eye,
      onClick: () => {
        /* TODO: implement edit */
      },
      disabled: false,
    },
    {
      label: "Move",
      icon: File,
      onClick: () => {
        /* TODO: implement move */
      },
      disabled: false,
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: () => {
        /* TODO: implement delete */
      },
      disabled: isBulkDeleting || selectedEmails.length === 0,
    },
  ];

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const showEllipsisStart = totalPages > 5 && currentPage > 3;
    const showEllipsisEnd = totalPages > 5 && currentPage < totalPages - 2;
    let pageNumbers = [];
    if (totalPages <= 5) {
      pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else if (currentPage <= 3) {
      pageNumbers = [1, 2, 3, 4, 5];
    } else if (currentPage >= totalPages - 2) {
      pageNumbers = Array.from({ length: 5 }, (_, i) => totalPages - 4 + i);
    } else {
      pageNumbers = [
        currentPage - 2,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        currentPage + 2,
      ];
    }
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className={
                currentPage === 1 ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
          {showEllipsisStart && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => setCurrentPage(1)}>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            </>
          )}
          {pageNumbers.map((pageNum) => (
            <PaginationItem key={pageNum}>
              <PaginationLink
                onClick={() => setCurrentPage(pageNum)}
                isActive={currentPage === pageNum}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          ))}
          {showEllipsisEnd && (
            <>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const renderEmailSkeletons = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          <TableCell>
            <Skeleton className="h-10 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-10 w-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-10 w-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-10" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-8 rounded-full ml-auto" />
          </TableCell>
        </TableRow>
      ));
  };

  const toggleSelectAll = () => {
    if (selectedEmails.length === paginatedEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(paginatedEmails.map((email) => email.id));
    }
  };

  const toggleSelectEmail = (emailId: string) => {
    setSelectedEmails((prev) =>
      prev.includes(emailId)
        ? prev.filter((id) => id !== emailId)
        : [...prev, emailId]
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between bg-white border-b px-4 py-2 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={
                selectedEmails.length === paginatedEmails.length &&
                paginatedEmails.length > 0
              }
              onCheckedChange={toggleSelectAll}
              aria-label="Select all"
            />
            {ACTIONS.map(({ label, icon: Icon, onClick, disabled }) => (
              <Button
                key={label}
                variant="ghost"
                size="icon"
                onClick={onClick}
                disabled={disabled}
                className="h-9 w-9"
              >
                <Icon className="h-5 w-5" />
                <span className="sr-only">{label}</span>
              </Button>
            ))}
          </div>
          <div className="relative w-full max-w-xs ml-auto">
            <Input
              placeholder="Search email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
        {/* Email Table */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="w-[40px]">{/* Checkbox */}</TableHead>
                <TableHead className="w-[180px]">Sender</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="w-[80px]">Size</TableHead>
                <TableHead className="w-[40px] text-center">Att</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                renderEmailSkeletons()
              ) : paginatedEmails.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-gray-500"
                  >
                    {searchTerm
                      ? "No emails match your search criteria"
                      : "No emails found"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedEmails.map((email) => {
                  const sizeKB =
                    (email.attachments.reduce(
                      (acc, att) => acc + (att.size || 0),
                      0
                    ) +
                      (email.content ? new Blob([email.content]).size : 0)) /
                    1024;
                  return (
                    <TableRow
                      key={email.id}
                      className="hover:bg-blue-50 cursor-pointer"
                      onClick={() => handleViewEmail(email)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedEmails.includes(email.id)}
                          onCheckedChange={() => toggleSelectEmail(email.id)}
                          aria-label={`Select ${email.subject}`}
                        />
                      </TableCell>
                      <TableCell className="truncate max-w-[160px]">
                        {email.from}
                      </TableCell>
                      <TableCell className="truncate max-w-[320px]">
                        {email.subject || (
                          <span className="text-gray-400">(No subject)</span>
                        )}
                        {email.attachments.length > 0 && (
                          <Paperclip className="inline ml-2 h-4 w-4 text-gray-400 align-middle" />
                        )}
                        <span className="block text-xs text-gray-500 truncate">
                          {email.content
                            .replace(/<[^>]*>/g, "")
                            .substring(0, 50)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="block">
                          {format(new Date(email.createdAt), "dd/MM/yyyy")}
                        </span>
                        <span className="block text-xs text-gray-400">
                          {format(new Date(email.createdAt), "HH:mm")}
                        </span>
                      </TableCell>
                      <TableCell>
                        {sizeKB ? `${sizeKB.toFixed(1)} KB` : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {email.attachments.length > 0 && (
                          <Paperclip className="h-4 w-4 text-gray-400 mx-auto" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          {renderPagination()}
        </div>
        {/* Dialog for viewing email details (reuse from Sent) */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Draft Details
              </DialogTitle>
            </DialogHeader>
            {selectedEmail && (
              <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">
                    Subject
                  </Label>
                  <p className="text-sm text-gray-900 font-medium">
                    {selectedEmail.subject || "No subject"}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-700">
                      From
                    </Label>
                    <p className="text-sm text-gray-900">
                      {selectedEmail.from}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-700">
                      Date Saved
                    </Label>
                    <p className="text-sm text-gray-900">
                      {format(
                        new Date(selectedEmail.createdAt),
                        "dd/MM/yyyy 'at' HH:mm"
                      )}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-700">
                      To
                    </Label>
                    <p className="text-sm text-gray-900 break-words">
                      {selectedEmail.to.join(", ")}
                    </p>
                  </div>
                  {selectedEmail.cc.length > 0 && (
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">
                        CC
                      </Label>
                      <p className="text-sm text-gray-900 break-words">
                        {selectedEmail.cc.join(", ")}
                      </p>
                    </div>
                  )}
                  {selectedEmail.bcc.length > 0 && (
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">
                        BCC
                      </Label>
                      <p className="text-sm text-gray-900 break-words">
                        {selectedEmail.bcc.join(", ")}
                      </p>
                    </div>
                  )}
                </div>
                <Separator />
                {selectedEmail.attachments.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700">
                        Attachments ({selectedEmail.attachments.length})
                      </Label>
                      {selectedEmail.attachments.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDownloadAttachments(selectedEmail.attachments)
                          }
                          className="text-xs"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download All
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-2 bg-gray-50 p-3 rounded-md">
                      {selectedEmail.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between text-sm text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-gray-100 rounded"
                        >
                          <div className="flex items-center">
                            <File className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate max-w-[300px]">
                              {attachment.fileName}
                            </span>
                          </div>
                          <Download className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Content
                  </Label>
                  <div
                    className="prose prose-sm max-w-none border rounded-lg p-4 bg-white overflow-auto max-h-[300px]"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.content }}
                  />
                </div>
              </div>
            )}
            <DialogFooter className="flex items-center justify-between gap-4 pt-4 border-t">
              <Button
                variant="destructive"
                onClick={() => selectedEmail && setIsDeleting(true)}
                disabled={isDeleting}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete Draft"}
              </Button>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DraftsPage;
