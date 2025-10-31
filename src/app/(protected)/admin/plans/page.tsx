"use client";

import * as React from "react";
import Link from 'next/link';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useAdminStore, Plan, PlanPurchaseStat } from "@/stores/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
// ✅ NEW: Added CloudLightning
import { MoreHorizontal, PlusCircle, Trash2, CloudLightning } from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, Legend } from 'recharts';
import { toast } from "sonner";

// Chart Component (No changes)
const PlanPurchaseChart = () => {
  const { planPurchaseStats, loading } = useAdminStore();

  if (loading.planPurchaseStats) {
    return <Skeleton className="h-[350px] w-full" />;
  }

  if (!planPurchaseStats || planPurchaseStats.length === 0) {
    return (
      <Card className="flex h-[350px] w-full items-center justify-center">
        <p className="text-muted-foreground">No purchase data available for active plans.</p>
      </Card>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={planPurchaseStats}>
        <PolarGrid />
        <PolarAngleAxis dataKey="plan_name" />
        <Tooltip contentStyle={{
          background: "hsl(var(--card))",
          borderColor: "hsl(var(--border))",
          borderRadius: "var(--radius)"
        }}/>
        <Legend />
        <Radar name="Purchases" dataKey="purchase_count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>
  );
};


// Main Page Component (No changes)
export default function PlansPage() {
  const { fetchPlans, fetchPlanPurchaseStats } = useAdminStore();

  React.useEffect(() => {
    fetchPlans(true); // Fetch all plans (including inactive)
    fetchPlanPurchaseStats();
  }, [fetchPlans, fetchPlanPurchaseStats]);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Manage Plans</h2>
        <Button asChild>
          <Link href="/admin/plans/new"><PlusCircle className="mr-2 h-4 w-4" /> Create New Plan</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Plan Purchase Statistics</CardTitle>
          <CardDescription>Purchases for active plans.</CardDescription>
        </CardHeader>
        <CardContent>
          <PlanPurchaseChart />
        </CardContent>
      </Card>
      <DataTable />
    </div>
  );
}

// Data Table Component (✅ UPDATED)
function DataTable() {
  // ✅ NEW: Destructure syncPlanWithGateway
  const { plans, loading, deletePlan, syncPlanWithGateway } = useAdminStore();
  
  const columns: ColumnDef<Plan>[] = [
    { accessorKey: "name", header: "Name", cell: ({ row }) => (
        <Link href={`/admin/plans/${row.original.id}`} className="font-medium text-primary underline-offset-4 hover:underline">{row.original.name}</Link>
      ),
    },
    { accessorKey: "price", header: "Price", cell: ({ row }) => `${row.original.price} ${row.original.currency}` },
    { accessorKey: "type", header: "Type", cell: ({ row }) => <Badge variant="secondary" className="capitalize">{row.original.type.replace('_', ' ')}</Badge> },
    { header: "Credits", cell: ({ row }) => `GS: ${row.original.gs_credits_granted}, Spec: ${row.original.specialized_credits_granted}`},
    { accessorKey: "is_active", header: "Status", cell: ({ row }) => row.original.is_active ? <Badge>Active</Badge> : <Badge variant="outline">Inactive</Badge> },
    
    // ✅ NEW: Show gateway sync status
    { 
      accessorKey: "payment_gateway_plan_id", 
      header: "Gateway Sync", 
      cell: ({ row }) => {
        const plan = row.original;
        if (plan.type === 'one_time') {
          return <Badge variant="outline">N/A</Badge>;
        }
        return plan.payment_gateway_plan_id ? <Badge variant="default">Synced</Badge> : <Badge variant="destructive">Not Synced</Badge>;
      }
    },
    
    // ✅ NEW: Updated actions cell
    { 
      id: "actions", 
      cell: ({ row }) => {
        const plan = row.original;
        const isSyncing = loading[`plan_sync_${plan.id}`];

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href={`/admin/plans/${plan.id}`}><DropdownMenuItem>Edit</DropdownMenuItem></Link>
              
              {/* --- THIS IS THE NEW PART --- */}
              {plan.type === 'recurring' && !plan.payment_gateway_plan_id && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => syncPlanWithGateway(plan.id)} disabled={isSyncing}>
                    <CloudLightning className="mr-2 h-4 w-4" />
                    {isSyncing ? "Syncing..." : "Sync with Gateway"}
                  </DropdownMenuItem>
                </>
              )}
              {/* --- END OF NEW PART --- */}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => deletePlan(plan.id)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: plans || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Card>
      <CardHeader><CardTitle>All Plans</CardTitle></CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            {/* ✅ NEW: Filled in TableHeader */}
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading.plans ? (
                 Array.from({ length: 5 }).map((_, i) => <TableRow key={i}>{columns.map((c, j) => <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>)}</TableRow>)
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No plans found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}