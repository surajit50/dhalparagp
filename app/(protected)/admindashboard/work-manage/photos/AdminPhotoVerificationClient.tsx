"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { verifyWorkPhoto, rejectWorkPhoto } from "@/action/work-photo-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  AlertTriangle,
  Building2,
  FileText,
  CheckCircle2,
  Clock,
  Download,
  Maximize2,
  Inbox,
  CalendarDays,
} from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

const POLL_INTERVAL_MS = 15000;
const ITEMS_PER_PAGE = 10;

const STAGE_ORDER = ["onset", "ongoing", "complete"] as const;

type WorkPhoto = {
  id: string;
  imageUrl: string;
  uploadedAt: string | Date;
  status: "onset" | "ongoing" | "complete";
  isVerified: boolean;
  isRejected: boolean;
  rejectionReason?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  worksDetailId: string;

  WorksDetail?: {
    ApprovedActionPlanDetails?: {
      activityDescription?: string | null;
    };
    nitDetails?: {
      memoNumber?: number | string | null;
    };
  };

  Bidagency?: {
    agencydetails?: {
      name?: string | null;
    };
  } | null;
};

export default function AdminPhotoVerificationClient({
  initialPhotos,
  availableYears,
  selectedYear,
}: {
  initialPhotos: WorkPhoto[];
  availableYears: number[];
  selectedYear: number | "all";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [photos, setPhotos] = useState(initialPhotos);
  const photosRef = useRef(initialPhotos);

  const [activeTab, setActiveTab] = useState("pending");
  const [visibleLimit, setVisibleLimit] = useState(ITEMS_PER_PAGE);
  const [viewingPhoto, setViewingPhoto] = useState<WorkPhoto | null>(null);
  const [rejectingPhoto, setRejectingPhoto] = useState<WorkPhoto | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Sync photos and reset UI when year filter changes
  useEffect(() => {
    setPhotos(initialPhotos);
    setVisibleLimit(ITEMS_PER_PAGE);
    setActiveTab("pending");
  }, [initialPhotos]);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", year);
    router.push(`?${params.toString()}`);
    // Refresh to ensure server-side data is up-to-date
    router.refresh();
  };

  // ✅ Optimized polling
  const pollPhotos = useCallback(async () => {
    try {
      const currentPhotos = photosRef.current;

      const latestDate =
        currentPhotos.length > 0
          ? new Date(
            Math.max(
              ...currentPhotos.map((p) =>
                new Date(p.uploadedAt).getTime()
              )
            )
          ).toISOString()
          : null;

      let url = `/api/work-photos?year=${selectedYear}`;
      if (latestDate) {
        url += `&after=${latestDate}`;
      }

      const res = await fetch(url);

      if (!res.ok) {
        console.error("Polling failed");
        return;
      }

      const fresh: WorkPhoto[] = await res.json();

      if (fresh.length) {
        setPhotos((prev) => {
          // Filter out any duplicates that might have been added by polling
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueFresh = fresh.filter(p => !existingIds.has(p.id));
          if (uniqueFresh.length === 0) return prev;
          return [...uniqueFresh, ...prev];
        });
        toast.info(`${fresh.length} new photo(s) uploaded`);
      }
    } catch (err) {
      console.error("Polling error", err);
    }
  }, [selectedYear]); // ✅ Add selectedYear dependency

  useEffect(() => {
    const timer = setInterval(pollPhotos, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [pollPhotos]); // ✅ Interval will reset when pollPhotos changes due to selectedYear change

  // ✅ Actions
  const handleVerify = async (id: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isVerified: true } : p))
    );

    const res = await verifyWorkPhoto(id, true);

    if (!res.success) {
      toast.error("Failed");
    }
  };

  const handleReject = async () => {
    if (!rejectingPhoto) return;

    const res = await rejectWorkPhoto(
      rejectingPhoto.id,
      rejectionReason
    );

    if (res.success) {
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === rejectingPhoto.id
            ? { ...p, isRejected: true }
            : p
        )
      );
      setRejectingPhoto(null);
    }
  };

  // ✅ Memoized filters
  const pending = useMemo(
    () => photos.filter((p) => !p.isVerified && !p.isRejected),
    [photos]
  );

  const verified = useMemo(
    () => photos.filter((p) => p.isVerified),
    [photos]
  );

  const rejected = useMemo(
    () => photos.filter((p) => p.isRejected),
    [photos]
  );

  // ✅ Grouping optimized
  const groupByWork = (list: WorkPhoto[]) => {
    return list.reduce((acc, p) => {
      if (!acc[p.worksDetailId]) acc[p.worksDetailId] = [];
      acc[p.worksDetailId].push(p);
      return acc;
    }, {} as Record<string, WorkPhoto[]>);
  };

  const renderGroup = (list: WorkPhoto[]) => {
    const grouped = groupByWork(list);
    const groups = Object.values(grouped).slice(0, visibleLimit);

    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-card border rounded-lg">
          <Inbox className="h-12 w-12 mb-4 opacity-20" />
          <p>No photos found for this year</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {groups.map((group) => {
          const first = group[0];

          return (
            <Card key={first.worksDetailId}>
              <CardHeader>
                <CardTitle>
                  {first.WorksDetail?.ApprovedActionPlanDetails
                    ?.activityDescription || "Work"}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex flex-wrap gap-4">
                {group.map((photo) => (
                  <StageCard
                    key={photo.id}
                    photo={photo}
                    onVerify={handleVerify}
                    onReject={setRejectingPhoto}
                    onView={setViewingPhoto}
                  />
                ))}
              </CardContent>
            </Card>
          );
        })}

        <Button onClick={() => setVisibleLimit((p) => p + ITEMS_PER_PAGE)}>
          Load More
        </Button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending">
                Pending ({pending.length})
              </TabsTrigger>
              <TabsTrigger value="verified">
                Verified ({verified.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejected.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            NIT Memo Year:
          </span>
          <Select
            value={selectedYear.toString()}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="w-[140px]">
              <CalendarDays className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="pending" className="mt-0">
          {renderGroup(pending)}
        </TabsContent>
        <TabsContent value="verified" className="mt-0">
          {renderGroup(verified)}
        </TabsContent>
        <TabsContent value="rejected" className="mt-0">
          {renderGroup(rejected)}
        </TabsContent>
      </Tabs>

      {/* Viewer */}
      <Dialog open={!!viewingPhoto} onOpenChange={() => setViewingPhoto(null)}>
        <DialogContent className="max-w-4xl p-1 overflow-hidden bg-transparent border-none">
          {viewingPhoto && (
            <div className="relative aspect-video w-full">
              <Image
                src={viewingPhoto.imageUrl}
                alt="Work Photo Large"
                fill
                className="object-contain"
                priority
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject */}
      <Dialog open={!!rejectingPhoto} onOpenChange={() => setRejectingPhoto(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject</DialogTitle>
          </DialogHeader>

          <Input
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />

          <DialogFooter>
            <Button onClick={handleReject}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ========================= */
/* Extracted Component       */
/* ========================= */

function StageCard({
  photo,
  onVerify,
  onReject,
  onView,
}: {
  photo: WorkPhoto;
  onVerify: (id: string) => void;
  onReject: (p: WorkPhoto) => void;
  onView: (p: WorkPhoto) => void;
}) {
  return (
    <div className="border rounded-lg overflow-hidden w-full sm:w-48 bg-card shadow-sm transition-all hover:shadow-md">
      <div
        className="relative h-32 cursor-pointer group"
        onClick={() => onView(photo)}
      >
        <Image
          src={photo.imageUrl}
          alt="Work Photo"
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Maximize2 className="text-white h-6 w-6" />
        </div>
        <Badge className="absolute top-2 right-2 capitalize text-[10px] px-1.5 h-4">
          {photo.status}
        </Badge>
      </div>

      <div className="p-2 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(photo.uploadedAt).toLocaleDateString()}
          </div>
          {photo.latitude && photo.longitude && (
            <a
              href={`https://maps.google.com?q=${photo.latitude},${photo.longitude}`}
              target="_blank"
              className="text-blue-500 hover:text-blue-600 transition-colors"
              title="View on Map"
            >
              <MapPin className="h-3 w-3" />
            </a>
          )}
        </div>

        {!photo.isVerified && !photo.isRejected && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-[10px] border-green-200 hover:bg-green-50 hover:text-green-600"
              onClick={() => onVerify(photo.id)}
            >
              Verify
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-[10px] border-red-200 hover:bg-red-50 hover:text-red-600"
              onClick={() => onReject(photo)}
            >
              Reject
            </Button>
          </div>
        )}

        {(photo.isVerified || photo.isRejected) && (
          <div className="pt-1">
            <Badge
              variant={photo.isVerified ? "default" : "destructive"}
              className="w-full justify-center text-[10px] h-6"
            >
              {photo.isVerified ? "Verified" : "Rejected"}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}