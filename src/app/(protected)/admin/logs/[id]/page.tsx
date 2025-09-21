"use client";

import * as React from "react";
import Link from 'next/link';
import { useAdminStore, AuditLog } from "@/stores/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    ChevronLeft,
    User,
    Clock,
    FileText,
    Database,
} from "lucide-react";
import { format, parseISO } from 'date-fns';
import { useParams } from "next/navigation";

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

const ActionBadge = ({ action }: { action: string }) => {
  const actionStyles: Record<string, string> = {
    INSERT: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800",
    UPDATE: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800",
    DELETE: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800",
  };
  return <Badge variant="outline" className={`font-mono text-xs ${actionStyles[action]}`}>{action}</Badge>;
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "N/A";
  return format(parseISO(dateString), "dd MMM, yyyy 'at' hh:mm a");
};

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: React.ReactNode | string }) => (
    <div>
        <Label className="text-sm text-muted-foreground">{label}</Label>
        <div className="flex items-center gap-2 pt-1">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{value}</span>
        </div>
    </div>
);

const JsonViewer = ({ data }: { data: object | null }) => {
    if (data === null || Object.keys(data).length === 0) {
        return <p className="text-sm text-muted-foreground italic">No Data</p>;
    }
    return (
        <pre className="mt-2 text-xs bg-secondary p-4 rounded-md overflow-x-auto">
            <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
    );
};

// =============================================================================
// SKELETON & MAIN COMPONENT
// =============================================================================

type AuditLogWithActor = AuditLog & { actor: { full_name: string } | null };

/**
 * Skeleton component for the detail page's loading state.
 */
function LogDetailPageSkeleton() {
  return (
    <div className="flex flex-col flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
            <CardContent className="space-y-5">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-24" /></CardHeader>
            <CardContent><Skeleton className="h-8 w-32" /></CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-24 w-full" />
              </div>
              <Separator />
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function LogDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { logs, loading, fetchLogs } = useAdminStore();

  const currentLog = React.useMemo(() => {
    return (logs as AuditLogWithActor[])?.find(log => log.id.toString() === id);
  }, [logs, id]);
  
  React.useEffect(() => {
    if (!logs) {
        fetchLogs();
    }
  }, [logs, fetchLogs]);

  // ✅ FIX: Handle loading state with an early return of a skeleton UI
  if (loading.logs || (logs && !currentLog)) {
    return <LogDetailPageSkeleton />;
  }

  // ✅ FIX: Handle "not found" state after loading is complete
  if (!currentLog) {
     return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <h2 className="text-2xl font-bold">Log Not Found</h2>
            <p className="text-muted-foreground">The log entry you are looking for does not exist.</p>
            <Button asChild className="mt-4">
              <Link href="/admin/logs"><ChevronLeft className="mr-2 h-4 w-4"/>Back to All Logs</Link>
            </Button>
        </div>
    );
  }

  // If we reach this point, `currentLog` is guaranteed to be defined.
  return (
    <div className="flex flex-col flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
            <Link href="/admin/logs"><ChevronLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Log Details</h2>
            <div className="text-muted-foreground text-sm">
                ID: {currentLog.id}
            </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Key Info & Action */}
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader><CardTitle>Key Information</CardTitle></CardHeader>
                <CardContent className="space-y-5">
                    <InfoItem icon={User} label="Actor" value={currentLog.actor?.full_name || "System"} />
                    <InfoItem icon={Database} label="Entity" value={currentLog.target_table} />
                    <InfoItem icon={FileText} label="Entity ID" value={<code className="text-xs">{currentLog.target_record_id}</code>} />
                    <InfoItem icon={Clock} label="Timestamp" value={formatDate(currentLog.timestamp)} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Action</CardTitle></CardHeader>
                <CardContent>
                    <div>
                        <Label>Action Performed</Label>
                        <div className="mt-1"><ActionBadge action={currentLog.action} /></div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Right Column: Data Changes */}
        <div className="lg:col-span-2">
            <Card>
                <CardHeader><CardTitle>Data Changes</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label className="text-base font-semibold">Old Record</Label>
                        <JsonViewer data={currentLog.old_record} />
                    </div>
                    <Separator />
                    <div>
                        <Label className="text-base font-semibold">New Record</Label>
                        <JsonViewer data={currentLog.new_record} />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}