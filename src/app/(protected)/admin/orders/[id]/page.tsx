"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAdminStore, CreditTransaction } from "@/stores/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft } from "lucide-react";
import { format, parseISO } from "date-fns";

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "N/A";
  try { return format(parseISO(dateString), "dd MMM yyyy, hh:mm a"); } catch { return "Invalid Date"; }
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { currentOrder, fetchOrderById, loading } = useAdminStore();

  React.useEffect(() => {
    if (id) fetchOrderById(id);
  }, [id, fetchOrderById]);

  const order = currentOrder;

  if (loading.currentOrder || !order) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <Skeleton className="h-10 w-1/2" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="lg:col-span-2 h-64" />
          <Skeleton className="lg:col-span-1 h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild><Link href="/admin/billing"><ChevronLeft className="h-4 w-4" /></Link></Button>
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Order Details</h2>
                <p className="text-muted-foreground font-mono text-xs">ID: {order.id}</p>
            </div>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="flex justify-between"><span>Status:</span> <Badge className="capitalize">{order.status}</Badge></div>
                        <div className="flex justify-between"><span>Amount Paid:</span> <span className="font-semibold">{order.amount_paid} {order.currency}</span></div>
                        <div className="flex justify-between"><span>Plan:</span> <span>{order.plan?.name || 'N/A'}</span></div>
                        <div className="flex justify-between"><span>User:</span> <Link href={`/admin/users/${order.user_id}`} className="text-primary hover:underline">{order.user.full_name}</Link></div>
                        <div className="flex justify-between"><span>Order Date:</span> <span>{formatDate(order.created_at)}</span></div>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader><CardTitle>Related Credit Transactions</CardTitle></CardHeader>
                    <CardContent>
                        {order.credit_transactions.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow><TableHead>Type</TableHead><TableHead>Amount</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.credit_transactions.map((tx: CreditTransaction) => (
                                        <TableRow key={tx.id}>
                                            <TableCell className="capitalize">{tx.credit_type}</TableCell>
                                            <TableCell className="font-semibold text-green-600">+{tx.amount}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-sm text-muted-foreground">No credits were granted for this order.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}