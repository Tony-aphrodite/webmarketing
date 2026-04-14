"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, FileText, Eye } from "lucide-react";
import { generateCSV } from "@/lib/admin";
import type { ColumnDef } from "@tanstack/react-table";

type FormType = "discovery_briefs" | "tenant_preferences" | "pymes_diagnosis";

interface FormRow {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  created_at: string;
  [key: string]: unknown;
}

const FORM_TYPES: { value: FormType; label: string; table: string }[] = [
  { value: "discovery_briefs", label: "Discovery Briefs (Owners)", table: "discovery_briefs" },
  { value: "tenant_preferences", label: "Tenant Preferences", table: "tenant_preferences" },
  { value: "pymes_diagnosis", label: "PYMES Diagnosis", table: "pymes_diagnosis" },
];

export default function AdminFormsPage() {
  const [formType, setFormType] = useState<FormType>("discovery_briefs");
  const [rows, setRows] = useState<FormRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<FormRow | null>(null);

  const supabase = createClient();

  const loadForms = useCallback(async () => {
    setLoading(true);

    const formConfig = FORM_TYPES.find((f) => f.value === formType)!;

    const { data } = await supabase
      .from(formConfig.table)
      .select("*, profiles:user_id(full_name, email)")
      .order("created_at", { ascending: false });

    const mapped = (data || []).map((row) => ({
      ...row,
      user_name: (row.profiles as unknown as { full_name: string } | null)?.full_name || "Unknown",
      user_email: (row.profiles as unknown as { email: string } | null)?.email || "",
    }));

    setRows(mapped as FormRow[]);
    setLoading(false);
  }, [supabase, formType]);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  function handleExportCSV() {
    if (rows.length === 0) return;

    const excludeKeys = ["profiles", "user_name", "user_email"];
    const keys = Object.keys(rows[0]).filter(
      (k) => !excludeKeys.includes(k)
    );

    const columns = [
      { key: "user_name", label: "User Name" },
      { key: "user_email", label: "Email" },
      ...keys.map((k) => ({
        key: k,
        label: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      })),
    ];

    const csv = generateCSV(rows as Record<string, unknown>[], columns);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formType}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const baseColumns: ColumnDef<FormRow>[] = [
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
      accessorKey: "created_at",
      header: "Submitted",
      cell: ({ row }) =>
        new Date(row.getValue("created_at")).toLocaleDateString("en-CA"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedRow(row.original)}
        >
          <Eye className="mr-1 h-3.5 w-3.5" />
          View
        </Button>
      ),
    },
  ];

  // Render selected form data
  const renderFormData = (data: FormRow) => {
    const excludeKeys = ["profiles", "user_name", "user_email", "id", "user_id"];
    return Object.entries(data)
      .filter(([key]) => !excludeKeys.includes(key))
      .map(([key, value]) => (
        <div key={key} className="grid grid-cols-3 gap-2 py-2 border-b last:border-0">
          <span className="text-sm font-medium text-muted-foreground col-span-1">
            {key.replace(/_/g, " ")}
          </span>
          <span className="text-sm col-span-2">
            {value === null || value === undefined
              ? "—"
              : typeof value === "boolean"
                ? value ? "Yes" : "No"
                : Array.isArray(value)
                  ? value.join(", ") || "—"
                  : String(value)}
          </span>
        </div>
      ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Form Management</h1>
          <p className="text-muted-foreground">
            View all form submissions and export data
          </p>
        </div>
        <Button variant="outline" onClick={handleExportCSV} disabled={rows.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Form type selector */}
      <div className="flex items-center gap-3">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <Select value={formType} onValueChange={(v) => setFormType(v as FormType)}>
          <SelectTrigger className="w-[300px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FORM_TYPES.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline">{rows.length} submissions</Badge>
      </div>

      <DataTable
        columns={baseColumns}
        data={rows}
        loading={loading}
        searchKey="user_name"
        searchPlaceholder="Search by user name..."
      />

      {/* Form Detail Dialog */}
      <Dialog open={!!selectedRow} onOpenChange={() => setSelectedRow(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Form Submission Details</DialogTitle>
            <DialogDescription>
              {selectedRow?.user_name} — {selectedRow?.user_email}
            </DialogDescription>
          </DialogHeader>
          {selectedRow && (
            <div className="pt-2">{renderFormData(selectedRow)}</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
