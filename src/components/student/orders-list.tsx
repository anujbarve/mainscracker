"use client";

import * as React from "react";
import { useStudentStore } from "@/stores/student";

// ✅ 1. Update the OrderWithPlan type to use 'succeeded'.
type OrderWithPlan = {
  id: string;
  created_at: string;
  status: 'succeeded' | 'pending' | 'failed'; // Changed from 'completed'
  amount_paid: number;
  currency: string;
  payment_gateway_charge_id: string | null;
  plans: {
    name: string;
  } | null;
};

// TanStack Table and other imports remain the same...
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconCircleCheck,
  IconHourglass,
  IconX,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";

// A dedicated status badge for order statuses
const OrderStatusBadge = ({ status }: { status: string }) => {
  // ✅ 2. Update the statusConfig to use 'succeeded'.
  const statusConfig = {
    succeeded: {
      label: "Succeeded",
      icon: <IconCircleCheck className="h-3 w-3" />,
      color: "bg-green-400/20 text-green-600 border-green-400/30",
    },
    pending: {
      label: "Pending",
      icon: <IconHourglass className="h-3 w-3" />,
      color: "bg-yellow-400/20 text-yellow-600 border-yellow-400/30",
    },
    failed: {
      label: "Failed",
      icon: <IconX className="h-3 w-3" />,
      color: "bg-red-400/20 text-red-600 border-red-400/30",
    },
  }[status] || {
    label: "Unknown",
    icon: <IconHourglass className="h-3 w-3" />,
    color: "bg-gray-400/20 text-gray-600 border-gray-400/30",
  };

  return (
    <Badge variant="outline" className={`gap-x-1.5 ${statusConfig.color}`}>
      {statusConfig.icon}
      {statusConfig.label}
    </Badge>
  );
};

// --- Column Definitions for the Orders Table (No changes needed here) ---
const columns: ColumnDef<OrderWithPlan>[] = [
    // ... columns remain the same
  {
    id: "planName",
    accessorFn: (row) => row.plans?.name,
    header: "Plan Purchased",
    cell: ({ row }) => <div className="font-medium">{row.original.plans?.name || "N/A"}</div>,
  },
  {
    accessorKey: "created_at",
    header: "Order Date And Time",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString() + " " + new Date(row.original.created_at).toLocaleTimeString(),
  },
  {
    accessorKey: "amount_paid",
    header: "Amount",
    cell: ({ row }) => {
      const formattedAmount = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: row.original.currency || "USD",
      }).format(row.original.amount_paid);
      return <div className="font-mono">{formattedAmount}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => (
      <div className="font-mono text-xs text-muted-foreground">
        {row.original.id.split('-')[0]}...
      </div>
    ),
  },
];


// --- Main Table Component for Order History (No changes needed here) ---
export function OrderHistoryTable() {
  const { orders, fetchUserOrders, loading } = useStudentStore();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  React.useEffect(() => {
    fetchUserOrders();
  }, [fetchUserOrders]);

  const table = useReactTable({
    data: orders || [],
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    // ... JSX for the table remains the same
    <main className="w-full min-h-[calc(100vh-theme(spacing.16))] p-4 sm:p-6 lg:p-8">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            A record of all your plan purchases and transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by plan name..."
                value={(table.getColumn("planName")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("planName")?.setFilterValue(event.target.value)
                }
                className="pl-9"
              />
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading && !orders ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={columns.length}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <IconChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next <IconChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}