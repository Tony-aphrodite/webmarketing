"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { ROLE_LABELS } from "@/lib/constants";
import type { ColumnDef } from "@tanstack/react-table";

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  role: string;
  property_count: number;
  is_premium_tenant: boolean;
  created_at: string;
}

const columns: ColumnDef<UserRow>[] = [
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
    cell: ({ row }) => (
      <Badge variant="outline">
        {ROLE_LABELS[row.getValue("role") as string] || row.getValue("role")}
      </Badge>
    ),
    filterFn: "equals",
  },
  {
    accessorKey: "property_count",
    header: "Properties",
  },
  {
    accessorKey: "created_at",
    header: "Registered",
    cell: ({ row }) =>
      new Date(row.getValue("created_at")).toLocaleDateString("en-CA"),
  },
];

const roleOptions = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [newRole, setNewRole] = useState("");
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const loadUsers = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, property_count, is_premium_tenant, created_at")
      .order("created_at", { ascending: false });

    setUsers(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleRoleChange() {
    if (!selectedUser || !newRole) return;
    setSaving(true);

    await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", selectedUser.id);

    setSelectedUser(null);
    setNewRole("");
    setSaving(false);
    loadUsers();
  }

  const columnsWithActions: ColumnDef<UserRow>[] = [
    ...columns,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedUser(row.original);
            setNewRole(row.original.role);
          }}
        >
          Edit Role
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">User Management</h1>
        <p className="text-muted-foreground">
          View and manage all registered users
        </p>
      </div>

      <DataTable
        columns={columnsWithActions}
        data={users}
        loading={loading}
        searchKey="email"
        searchPlaceholder="Search by email..."
        filters={[
          {
            key: "role",
            label: "Role",
            options: roleOptions,
          },
        ]}
      />

      {/* Role Edit Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Changing the role for {selectedUser?.full_name} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Role</label>
              <Select value={newRole} onValueChange={(v) => v && setNewRole(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Cancel
              </Button>
              <Button onClick={handleRoleChange} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
