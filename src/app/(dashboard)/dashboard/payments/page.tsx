import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CreditCard, Download, Receipt } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/admin";

const STATUS_BADGES: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  completed: { variant: "default", label: "Completed" },
  pending: { variant: "secondary", label: "Pending" },
  failed: { variant: "destructive", label: "Failed" },
  refunded: { variant: "outline", label: "Refunded" },
};

export default async function PaymentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch payments with service/plan names
  const { data: payments } = await supabase
    .from("payments")
    .select(`
      *,
      services:service_id (name),
      pymes_plans:pymes_plan_id (name)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const totalPaid = payments
    ?.filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

  const pendingCount = payments?.filter((p) => p.status === "pending").length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment History</h1>
        <p className="text-muted-foreground">
          Track your payments and installments
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Payments table */}
      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
          <CardDescription>Your complete payment history</CardDescription>
        </CardHeader>
        <CardContent>
          {!payments || payments.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CreditCard className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No payments yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your payments will appear here once you subscribe to a service.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Service / Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Installment</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => {
                    const serviceName =
                      payment.services?.name ||
                      payment.pymes_plans?.name ||
                      "—";
                    const badge = STATUS_BADGES[payment.status] || STATUS_BADGES.pending;

                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(payment.created_at)}
                        </TableCell>
                        <TableCell>{serviceName}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(Number(payment.amount))}
                        </TableCell>
                        <TableCell className="capitalize">
                          {payment.payment_type?.replace("_", " ") || "One-time"}
                        </TableCell>
                        <TableCell>
                          {payment.installment_number
                            ? `${payment.installment_number} of ${payment.total_installments || "—"}`
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
