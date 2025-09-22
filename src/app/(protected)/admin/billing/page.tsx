"use client";

import * as React from "react";
import Link from "next/link";
import { useAdminStore, OrderWithDetails, CreditTransactionWithDetails } from "@/stores/admin";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "N/A";
  try { return format(parseISO(dateString), "dd MMM yyyy, hh:mm a"); } catch { return "Invalid Date"; }
};

const CreditEconomyChart = () => {
    const { creditEconomyTrends, loading } = useAdminStore();
    if (loading.creditEconomyTrends) return <Skeleton className="h-[300px] w-full" />;
    if (!creditEconomyTrends) return <p className="text-center text-muted-foreground">No data available.</p>;

    const chartData = creditEconomyTrends.map(d => ({ ...d, period: format(parseISO(d.period), "MMM d") }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="period" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "var(--radius)" }} />
                <Legend wrapperStyle={{ fontSize: "0.8rem" }} />
                <Area type="monotone" dataKey="purchased" name="Purchased" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                <Area type="monotone" dataKey="consumed" name="Consumed" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default function BillingPage() {
  const { fetchCreditEconomyTrends } = useAdminStore();
  React.useEffect(() => { fetchCreditEconomyTrends(); }, [fetchCreditEconomyTrends]);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight">Billing & Economy</h2>
      <Card>
        <CardHeader><CardTitle>Credit Economy Trends (30d)</CardTitle><CardDescription>Credits purchased vs. consumed across the platform.</CardDescription></CardHeader>
        <CardContent><CreditEconomyChart /></CardContent>
      </Card>
      <Tabs defaultValue="orders">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="credit_ledger">Credit Ledger</TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="mt-4"><OrdersTable /></TabsContent>
        <TabsContent value="credit_ledger" className="mt-4"><CreditLedgerTable /></TabsContent>
      </Tabs>
    </div>
  );
}

function OrdersTable() {
    const { paginatedOrders, fetchPaginatedOrders, loading } = useAdminStore();
    const [{ pageIndex, pageSize }, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
    const [statusFilter, setStatusFilter] = React.useState('');

    React.useEffect(() => {
        fetchPaginatedOrders(pageIndex, pageSize, { status: statusFilter === 'all' ? undefined : statusFilter });
    }, [pageIndex, pageSize, statusFilter, fetchPaginatedOrders]);

    const pageCount = paginatedOrders ? Math.ceil(paginatedOrders.count / pageSize) : 0;
    
    const columns: ColumnDef<OrderWithDetails>[] = [
        { accessorKey: "id", header: "Order ID", cell: ({ row }) => <Link href={`/admin/orders/${row.original.id}`} className="font-mono text-xs text-primary hover:underline">{row.original.id.substring(0, 8)}...</Link> },
        { accessorKey: "user.full_name", header: "User", cell: ({ row }) => row.original.user?.full_name || 'N/A' },
        { accessorKey: "plan.name", header: "Plan" },
        { accessorKey: "amount_paid", header: "Amount", cell: ({ row }) => `₹${row.original.amount_paid}` },
        { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge className="capitalize">{row.original.status}</Badge> },
        { accessorKey: "created_at", header: "Date", cell: ({ row }) => formatDate(row.original.created_at) },
        { id: "actions", cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent><Link href={`/admin/orders/${row.original.id}`}><DropdownMenuItem>View Details</DropdownMenuItem></Link></DropdownMenuContent>
            </DropdownMenu>
        )},
    ];

    const table = useReactTable({
        data: paginatedOrders?.data ?? [],
        columns,
        pageCount,
        state: { pagination: { pageIndex, pageSize } },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    });

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>A paginated list of all orders.</CardDescription>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by status..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="succeeded">Succeeded</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map(headerGroup => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {loading.paginatedOrders ? (
                                Array.from({ length: 10 }).map((_, i) => <TableRow key={i}>{columns.map((c, j) => <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>)}</TableRow>)
                            ) : table.getRowModel().rows.length ? table.getRowModel().rows.map(row => <TableRow key={row.id}>{row.getVisibleCells().map(cell => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>)
                            : <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No orders found.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button variant="outline" size="sm" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>« First</Button>
                    <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>‹ Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next ›</Button>
                    <Button variant="outline" size="sm" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>Last »</Button>
                </div>
            </CardContent>
        </Card>
    );
}


function CreditLedgerTable() {
    const { paginatedCreditTxs, fetchPaginatedCreditTxs, loading } = useAdminStore();
    const [{ pageIndex, pageSize }, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
    const [typeFilter, setTypeFilter] = React.useState('');

    React.useEffect(() => {
        fetchPaginatedCreditTxs(pageIndex, pageSize, { type: typeFilter === 'all' ? undefined : typeFilter });
    }, [pageIndex, pageSize, typeFilter, fetchPaginatedCreditTxs]);

    const pageCount = paginatedCreditTxs ? Math.ceil(paginatedCreditTxs.count / pageSize) : 0;
    
    const columns: ColumnDef<CreditTransactionWithDetails>[] = [
        { accessorKey: "user.full_name", header: "User", cell: ({ row }) => row.original.user?.full_name || 'N/A' },
        { accessorKey: "transaction_type", header: "Transaction Type", cell: ({ row }) => <Badge variant="secondary" className="capitalize">{row.original.transaction_type.replace('_', ' ')}</Badge> },
        { accessorKey: "credit_type", header: "Credit Type", cell: ({ row }) => <span className="font-semibold uppercase">{row.original.credit_type}</span> },
        { accessorKey: "amount", header: "Amount", cell: ({ row }) => (
            <span className={row.original.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                {row.original.amount > 0 ? `+${row.original.amount}` : row.original.amount}
            </span>
        )},
        { accessorKey: "balance_after", header: "Balance After" },
        { accessorKey: "notes", header: "Notes" },
        { accessorKey: "created_at", header: "Date", cell: ({ row }) => formatDate(row.original.created_at) },
    ];

    const table = useReactTable({
        data: paginatedCreditTxs?.data ?? [],
        columns,
        pageCount,
        state: { pagination: { pageIndex, pageSize } },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    });

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Credit Ledger</CardTitle>
                        <CardDescription>A paginated audit trail of all credit transactions.</CardDescription>
                    </div>
                     <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filter by transaction type..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="purchase">Purchase</SelectItem>
                            <SelectItem value="consumption">Consumption</SelectItem>
                            <SelectItem value="refund">Refund</SelectItem>
                            <SelectItem value="admin_adjustment">Admin Adjustment</SelectItem>
                            <SelectItem value="bonus">Bonus</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                     <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map(headerGroup => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {loading.paginatedCreditTxs ? (
                                Array.from({ length: 10 }).map((_, i) => <TableRow key={i}>{columns.map((c, j) => <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>)}</TableRow>)
                            ) : table.getRowModel().rows.length ? table.getRowModel().rows.map(row => <TableRow key={row.id}>{row.getVisibleCells().map(cell => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>)
                            : <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No transactions found.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button variant="outline" size="sm" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>« First</Button>
                    <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>‹ Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next ›</Button>
                    <Button variant="outline" size="sm" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>Last »</Button>
                </div>
            </CardContent>
        </Card>
    );
}