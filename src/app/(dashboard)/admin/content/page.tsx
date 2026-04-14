"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Save, PenSquare } from "lucide-react";

interface ContentItem {
  id: string;
  section: string;
  key: string;
  value: string;
  updated_at: string;
}

const SECTIONS = [
  { value: "landing_hero", label: "Landing Page - Hero" },
  { value: "landing_features", label: "Landing Page - Features" },
  { value: "landing_cta", label: "Landing Page - CTA" },
  { value: "testimonials", label: "Testimonials" },
  { value: "faq", label: "FAQ" },
  { value: "service_descriptions", label: "Service Descriptions" },
];

export default function AdminContentPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState("landing_hero");
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const supabase = createClient();

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("site_content")
      .select("*")
      .order("section")
      .order("key");

    setItems(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredItems = items.filter((i) => i.section === selectedSection);

  async function handleUpdate(id: string, value: string) {
    setSaving(id);
    setMessage(null);

    await supabase.from("site_content").update({ value }).eq("id", id);

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, value } : i))
    );
    setSaving(null);
    setMessage("Saved");
    setTimeout(() => setMessage(null), 2000);
  }

  async function handleAdd() {
    if (!newKey.trim()) return;
    setSaving("new");

    await supabase.from("site_content").insert({
      section: selectedSection,
      key: newKey.trim(),
      value: newValue,
    });

    setNewKey("");
    setNewValue("");
    setSaving(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this content item?")) return;
    await supabase.from("site_content").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Content Management</h1>
        <p className="text-muted-foreground">
          Edit landing page text, testimonials, FAQ, and service descriptions
        </p>
      </div>

      {message && (
        <div className="rounded-md bg-green-100 p-3 text-sm text-green-800">
          {message}
        </div>
      )}

      {/* Section selector */}
      <div className="flex items-center gap-3">
        <PenSquare className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedSection} onValueChange={(v) => v && setSelectedSection(v)}>
          <SelectTrigger className="w-[300px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SECTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline">{filteredItems.length} items</Badge>
      </div>

      {/* Content items */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-mono">{item.key}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ContentEditor
                value={item.value}
                saving={saving === item.id}
                onSave={(v) => handleUpdate(item.id, v)}
              />
            </CardContent>
          </Card>
        ))}

        {filteredItems.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No content items in this section yet.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add new item */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add New Content Item</CardTitle>
          <CardDescription>
            Add a new key-value pair to the {SECTIONS.find((s) => s.value === selectedSection)?.label} section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Key</Label>
            <Input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="e.g., hero_title"
            />
          </div>
          <div className="space-y-2">
            <Label>Value</Label>
            <Textarea
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Content text..."
              rows={3}
            />
          </div>
          <Button onClick={handleAdd} disabled={saving === "new" || !newKey.trim()}>
            <Plus className="mr-2 h-4 w-4" />
            {saving === "new" ? "Adding..." : "Add Item"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ContentEditor({
  value: initial,
  saving,
  onSave,
}: {
  value: string;
  saving: boolean;
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(initial);
  const changed = value !== initial;

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
      />
      {changed && (
        <Button size="sm" onClick={() => onSave(value)} disabled={saving}>
          <Save className="mr-1 h-3.5 w-3.5" />
          {saving ? "Saving..." : "Save"}
        </Button>
      )}
    </div>
  );
}
