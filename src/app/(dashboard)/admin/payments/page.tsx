"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, CreditCard, TrendingUp } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

interface PaymentRow {
  id: string;
  user_name: string;
  user_email: string;
  service_name: string;
  amount: number;
  currency: string;
  payment_type: string | null;
  installment_number: number | null;
  status: string;
  created_at: string;
}

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  pending: "secondary",
  failed: "destructive",
  refunded: "outline",
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const loadPayments = useCallback(async () => {
    const { data } = await supabase
      .from("payments")
      .select(`
        id, amount, currency, payment_type, installment_number, status, created_at,
        profiles:user_id(full_name, email),
        services:service_id(name),
        pymes_plans:pymes_plan_id(name)
      `)
      .order("created_at", { ascending: false });

    const mapped = (data || []).map((p) => ({
      id: p.id,
      user_name: (p.profiles as unknown as { full_name: string } | null)?.full_name || "Unknown",
      user_email: (p.profiles as unknown as { email: string } | null)?.email || "",
      service_name: (p.services as unknown as { name: string } | null)?.name ||
        (p.pymes_plans as unknown as { name: string } | null)?.name || "—",
      amount: Number(p.amount) || 0,
      currency: p.currency || "CAD",
      payment_type: p.payment_type,
      installment_number: p.installment_number,
      status: p.status,
      created_at: p.created_at,
    }));

    setPayments(mapped);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const totalRevenue = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const columns: ColumnDef<PaymentRow>[] = [
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) =>
        new Date(row.getValue("created_at")).toLocaleDateString("en-CA"),
    },
    {
      accessorKey: "user_name",
      header: "User",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.getValue("user_name")}</p>
          <p className="text-xs text-muted-foreground">{row.original.user_email}</p>
        </div>
      ),
    },
    {
      accessorKey: "service_name",
      header: "Service / Plan",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) =>
        `$${(row.getValue("amount") as number).toLocaleString()} ${row.original.currency}`,
    },
    {
      accessorKey: "payment_type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("payment_type") as string | null;
        return (
          <span className="capitalize">{type?.replace("_", " ") || "One-time"}</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={STATUS_VARIANTS[status] || "secondary"} className="capitalize">
            {status}
          </Badge>
        );
      },
      filterFn: "equals",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Management</h1>
        <p className="text-muted-foreground">
          View all payments and revenue reports
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString()} CAD
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${pendingAmount.toLocaleString()} CAD
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        loading={loading}
        searchKey="user_name"
        searchPlaceholder="Search by user..."
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "completed", label: "Completed" },
              { value: "pending", label: "Pending" },
              { value: "failed", label: "Failed" },
              { value: "refunded", label: "Refunded" },
            ],
          },
        ]}
      />
    </div>
  );
}
