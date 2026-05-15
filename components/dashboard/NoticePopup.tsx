"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, Download, X } from "lucide-react";
import { getUnreadAgencyNotices, acknowledgeNotice } from "@/action/notice";
import { formatDate } from "@/utils/utils";
import Link from "next/link";
import { toast } from "sonner";

export function NoticePopup() {
  const [notices, setNotices] = useState<any[]>([]);
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const result = await getUnreadAgencyNotices();
        if (result.success && result.data && result.data.length > 0) {
          setNotices(result.data);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Failed to fetch unread notices:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotices();
  }, []);

  const handleNext = async () => {
    const currentNotice = notices[currentNoticeIndex];
    
    // Acknowledge the current notice
    try {
      await acknowledgeNotice(currentNotice.id);
    } catch (error) {
      console.error("Failed to acknowledge notice:", error);
    }

    if (currentNoticeIndex < notices.length - 1) {
      setCurrentNoticeIndex(prev => prev + 1);
    } else {
      setIsOpen(false);
      toast.success("All notices acknowledged");
    }
  };

  const handleDismissAll = async () => {
    try {
      // Acknowledge all remaining notices
      const remainingNotices = notices.slice(currentNoticeIndex);
      await Promise.all(remainingNotices.map(notice => acknowledgeNotice(notice.id)));
      setIsOpen(false);
      toast.success("All notices dismissed");
    } catch (error) {
      console.error("Failed to dismiss all notices:", error);
      toast.error("Failed to dismiss some notices");
    }
  };

  if (notices.length === 0 || !isOpen) return null;

  const currentNotice = notices[currentNoticeIndex];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-orange-600 mb-2">
            <Bell className="h-5 w-5 animate-bounce" />
            <span className="text-sm font-bold uppercase tracking-wider">
              New Official Notice
            </span>
          </div>
          <DialogTitle className="text-xl font-bold">
            {currentNotice.title}
          </DialogTitle>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            <span>Ref: {currentNotice.reference}</span>
            <span>{formatDate(currentNotice.createdAt)}</span>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 max-h-[300px] overflow-y-auto">
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {currentNotice.description}
            </p>
          </div>

          {currentNotice.files && currentNotice.files.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase">
                Attachments
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentNotice.files.map((file: any) => (
                  <Link key={file.id} href={file.url} target="_blank">
                    <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                      <Download className="h-3 w-3" />
                      {file.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex sm:justify-between items-center gap-4">
          <div className="text-xs text-muted-foreground">
            Notice {currentNoticeIndex + 1} of {notices.length}
          </div>
          <div className="flex gap-2">
            {notices.length > 1 && (
              <Button variant="ghost" size="sm" onClick={handleDismissAll}>
                Dismiss All
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentNoticeIndex < notices.length - 1 ? "Next Notice" : "I Understand"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
