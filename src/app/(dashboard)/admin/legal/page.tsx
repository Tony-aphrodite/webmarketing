"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/dashboard/data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Download, Scale, Shield, FileText } from "lucide-react";
import { generateCSV, formatDateTime } from "@/lib/admin";
import type { ColumnDef } from "@tanstack/react-table";

interface ConsentRow {
  id: string;
  user_name: string;
  user_email: string;
  consent_type: string;
  granted: boolean;
  granted_at: string;
}

interface LegalDoc {
  id: string;
  type: string;
  content: string;
  version: string;
  updated_at: string;
}

const CONSENT_TYPE_LABELS: Record<string, string> = {
  data_processing: "Data Processing",
  image_usage: "Image Usage",
  marketing: "Marketing",
  third_party: "Third-Party",
};

export default function AdminLegalPage() {
  const [consents, setConsents] = useState<ConsentRow[]>([]);
  const [legalDocs, setLegalDocs] = useState<LegalDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDoc, setEditDoc] = useState<LegalDoc | null>(null);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const load = useCallback(async () => {
    const [{ data: consentData }, { data: docData }] = await Promise.all([
      supabase
        .from("consent_logs")
        .select("id, consent_type, granted, granted_at, profiles:user_id(full_name, email)")
        .order("granted_at", { ascending: false })
        .limit(200),
      supabase
        .from("legal_documents")
        .select("*")
        .order("type"),
    ]);

    const mappedConsents = (consentData || []).map((c) => ({
      id: c.id,
      user_name: (c.profiles as unknown as { full_name: string } | null)?.full_name || "Unknown",
      user_email: (c.profiles as unknown as { email: string } | null)?.email || "",
      consent_type: c.consent_type,
      granted: c.granted,
      granted_at: c.granted_at,
    }));

    setConsents(mappedConsents);
    setLegalDocs((docData as LegalDoc[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  function handleExportConsents() {
    if (consents.length === 0) return;

    const csv = generateCSV(
      consents as unknown as Record<string, unknown>[],
      [
        { key: "user_name", label: "User Name" },
        { key: "user_email", label: "Email" },
        { key: "consent_type", label: "Consent Type" },
        { key: "granted", label: "Granted" },
        { key: "granted_at", label: "Date" },
      ]
    );

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "consent_logs_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function saveLegalDoc() {
    if (!editDoc) return;
    setSaving(true);

    await supabase
      .from("legal_documents")
      .upsert(
        {
          id: editDoc.id,
          type: editDoc.type,
          content: editDoc.content,
          version: editDoc.version,
        },
        { onConflict: "id" }
      );

    setSaving(false);
    setEditDoc(null);
    load();
  }

  const consentColumns: ColumnDef<ConsentRow>[] = [
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
      accessorKey: "consent_type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline">
          {CONSENT_TYPE_LABELS[row.getValue("consent_type") as string] || row.getValue("consent_type")}
        </Badge>
      ),
      filterFn: "equals",
    },
    {
      accessorKey: "granted",
      header: "Status",
      cell: ({ row }) =>
        row.getValue("granted") ? (
          <Badge className="bg-green-50 text-green-700">Granted</Badge>
        ) : (
          <Badge className="bg-red-50 text-red-700">Revoked</Badge>
        ),
    },
    {
      accessorKey: "granted_at",
      header: "Date",
      cell: ({ row }) => formatDateTime(row.getValue("granted_at")),
    },
  ];

  const consentTypeOptions = Object.entries(CONSENT_TYPE_LABELS).map(
    ([value, label]) => ({ value, label })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Legal & Compliance</h1>
        <p className="text-muted-foreground">
          GDPR/PIPEDA compliance tracking, consent logs, and legal documents
        </p>
      </div>

      {/* Consent Logs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Consent Logs
            </CardTitle>
            <CardDescription>User consent activity</CardDescription>
          </div>
          <Button variant="outline" onClick={handleExportConsents} disabled={consents.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={consentColumns}
            data={consents}
            loading={loading}
            searchKey="user_name"
            searchPlaceholder="Search by user..."
            filters={[
              {
                key: "consent_type",
                label: "Type",
                options: consentTypeOptions,
              },
            ]}
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Legal Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Legal Documents
          </CardTitle>
          <CardDescription>
            Privacy policy, terms of service, and other legal texts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {legalDocs.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground text-center">
              No legal documents configured yet. Create a &quot;legal_documents&quot; table to manage them.
            </p>
          ) : (
            <div className="space-y-4">
              {legalDocs.map((doc) => (
                <Card key={doc.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base capitalize">
                        {doc.type.replace(/_/g, " ")}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">v{doc.version}</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditDoc({ ...doc })}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {doc.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Legal Doc */}
      {editDoc && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-base">
              Editing: {editDoc.type.replace(/_/g, " ")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Version</Label>
              <input
                className="flex h-9 w-32 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={editDoc.version}
                onChange={(e) => setEditDoc({ ...editDoc, version: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={editDoc.content}
                onChange={(e) => setEditDoc({ ...editDoc, content: e.target.value })}
                rows={12}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditDoc(null)}>
                Cancel
              </Button>
              <Button onClick={saveLegalDoc} disabled={saving}>
                {saving ? "Saving..." : "Save Document"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
