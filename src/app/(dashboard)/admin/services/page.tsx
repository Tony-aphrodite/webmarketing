"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Plus } from "lucide-react";
import { ROLE_LABELS } from "@/lib/constants";
import type { ColumnDef } from "@tanstack/react-table";

interface ServiceRow {
  id: string;
  name: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  tier: string | null;
  price: number;
  currency: string;
  is_active: boolean;
  target_roles: string[];
  features: string[];
  created_at: string;
}

const EMPTY_SERVICE: Partial<ServiceRow> = {
  name: "",
  description: "",
  category: "",
  subcategory: "",
  tier: "",
  price: 0,
  currency: "CAD",
  is_active: true,
  target_roles: [],
  features: [],
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editService, setEditService] = useState<Partial<ServiceRow> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [featuresText, setFeaturesText] = useState("");

  const supabase = createClient();

  const loadServices = useCallback(async () => {
    const { data } = await supabase
      .from("services")
      .select("*")
      .order("category")
      .order("name");

    setServices(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  function openNew() {
    setEditService({ ...EMPTY_SERVICE });
    setFeaturesText("");
    setIsNew(true);
  }

  function openEdit(service: ServiceRow) {
    setEditService({ ...service });
    setFeaturesText((service.features || []).join("\n"));
    setIsNew(false);
  }

  async function handleSave() {
    if (!editService?.name) return;
    setSaving(true);

    const payload = {
      name: editService.name,
      description: editService.description || null,
      category: editService.category || "",
      subcategory: editService.subcategory || null,
      tier: editService.tier || null,
      price: editService.price || 0,
      currency: editService.currency || "CAD",
      is_active: editService.is_active ?? true,
      target_roles: editService.target_roles || [],
      features: featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
    };

    if (isNew) {
      await supabase.from("services").insert(payload);
    } else {
      await supabase.from("services").update(payload).eq("id", editService.id!);
    }

    setEditService(null);
    setSaving(false);
    loadServices();
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from("services").update({ is_active: !current }).eq("id", id);
    loadServices();
  }

  const columns: ColumnDef<ServiceRow>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      filterFn: "equals",
    },
    {
      accessorKey: "tier",
      header: "Tier",
      cell: ({ row }) => row.getValue("tier") || "—",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) =>
        `$${(row.getValue("price") as number).toLocaleString()} ${row.original.currency}`,
    },
    {
      accessorKey: "target_roles",
      header: "Target Roles",
      cell: ({ row }) => {
        const roles = row.getValue("target_roles") as string[];
        return (
          <div className="flex flex-wrap gap-1">
            {roles.map((r) => (
              <Badge key={r} variant="outline" className="text-xs">
                {ROLE_LABELS[r] || r}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Active",
      cell: ({ row }) => (
        <Switch
          checked={row.getValue("is_active") as boolean}
          onCheckedChange={() =>
            toggleActive(row.original.id, row.original.is_active)
          }
        />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => openEdit(row.original)}>
          Edit
        </Button>
      ),
    },
  ];

  // Extract unique categories for filter
  const categoryOptions = Array.from(
    new Set(services.map((s) => s.category).filter(Boolean))
  ).map((c) => ({ value: c, label: c }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Service Catalog</h1>
          <p className="text-muted-foreground">
            Manage services and PYMES plans
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Service
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={services}
        loading={loading}
        searchKey="name"
        searchPlaceholder="Search by name..."
        filters={
          categoryOptions.length > 0
            ? [{ key: "category", label: "Category", options: categoryOptions }]
            : undefined
        }
      />

      {/* Service Editor Dialog */}
      <Dialog open={!!editService} onOpenChange={() => setEditService(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? "New Service" : "Edit Service"}</DialogTitle>
            <DialogDescription>
              {isNew ? "Create a new service" : `Editing: ${editService?.name}`}
            </DialogDescription>
          </DialogHeader>
          {editService && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editService.name || ""}
                  onChange={(e) =>
                    setEditService({ ...editService, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editService.description || ""}
                  onChange={(e) =>
                    setEditService({ ...editService, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={editService.category || ""}
                    onChange={(e) =>
                      setEditService({ ...editService, category: e.target.value })
                    }
                    placeholder="e.g., photography"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subcategory</Label>
                  <Input
                    value={editService.subcategory || ""}
                    onChange={(e) =>
                      setEditService({ ...editService, subcategory: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tier</Label>
                  <Input
                    value={editService.tier || ""}
                    onChange={(e) =>
                      setEditService({ ...editService, tier: e.target.value })
                    }
                    placeholder="e.g., elite"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price (CAD)</Label>
                  <Input
                    type="number"
                    value={editService.price || 0}
                    onChange={(e) =>
                      setEditService({ ...editService, price: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Features (one per line)</Label>
                <Textarea
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  rows={4}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={editService.is_active ?? true}
                  onCheckedChange={(checked) =>
                    setEditService({ ...editService, is_active: checked })
                  }
                />
                <Label>Active</Label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditService(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : isNew ? "Create" : "Update"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
