"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import {
  ROLE_LABELS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
  LEAD_STATUS_TRANSITIONS,
} from "@/lib/constants";
import type { ColumnDef } from "@tanstack/react-table";

interface LeadRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string | null;
  source: string | null;
  status: string;
  notes: string | null;
  assigned_to: string | null;
  created_at: string;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const loadLeads = useCallback(async () => {
    const { data } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    setLeads(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  async function handleStatusUpdate() {
    if (!selectedLead) return;
    setSaving(true);

    const updates: Record<string, unknown> = {};
    if (newStatus && newStatus !== selectedLead.status) {
      updates.status = newStatus;
    }
    if (notes !== (selectedLead.notes || "")) {
      updates.notes = notes || null;
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from("leads").update(updates).eq("id", selectedLead.id);
    }

    setSelectedLead(null);
    setSaving(false);
    loadLeads();
  }

  const columns: ColumnDef<LeadRow>[] = [
    {
      accessorKey: "full_name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("full_name")}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string | null;
        return role ? (
          <Badge variant="outline">
            {ROLE_LABELS[role] || role}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
      filterFn: "equals",
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => row.getValue("source") || "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const colors = LEAD_STATUS_COLORS[status];
        return (
          <Badge className={`${colors?.bg || ""} ${colors?.text || ""} ${colors?.border || ""}`}>
            {LEAD_STATUS_LABELS[status] || status}
          </Badge>
        );
      },
      filterFn: "equals",
    },
    {
      accessorKey: "created_at",
      header: "Date",
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
          onClick={() => {
            const lead = row.original;
            setSelectedLead(lead);
            setNewStatus(lead.status);
            setNotes(lead.notes || "");
          }}
        >
          Manage
        </Button>
      ),
    },
  ];

  const statusOptions = Object.entries(LEAD_STATUS_LABELS).map(
    ([value, label]) => ({ value, label })
  );

  // Available transitions for selected lead
  const allowedStatuses = selectedLead
    ? [
        selectedLead.status,
        ...(LEAD_STATUS_TRANSITIONS[selectedLead.status] || []),
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lead Management</h1>
        <p className="text-muted-foreground">
          Track and manage leads through the status workflow
        </p>
      </div>

      <DataTable
        columns={columns}
        data={leads}
        loading={loading}
        searchKey="email"
        searchPlaceholder="Search by email..."
        filters={[
          {
            key: "status",
            label: "Status",
            options: statusOptions,
          },
        ]}
      />

      {/* Lead Management Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Lead</DialogTitle>
            <DialogDescription>
              {selectedLead?.full_name} — {selectedLead?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={newStatus} onValueChange={(v) => v && setNewStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allowedStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {LEAD_STATUS_LABELS[s] || s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Workflow: nuevo → contactado → en_proceso → cerrado
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this lead..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedLead(null)}>
                Cancel
              </Button>
              <Button onClick={handleStatusUpdate} disabled={saving}>
                {saving ? "Saving..." : "Update Lead"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
