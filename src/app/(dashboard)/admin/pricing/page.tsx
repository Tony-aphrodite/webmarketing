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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, DollarSign, Percent, Tag } from "lucide-react";

interface ServicePrice {
  id: string;
  name: string;
  price: number;
  currency: string;
  is_active: boolean;
}

interface Promotion {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  max_uses: number | null;
  used_count: number;
}

export default function AdminPricingPage() {
  const [services, setServices] = useState<ServicePrice[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPromo, setEditPromo] = useState<Partial<Promotion> | null>(null);
  const [isNewPromo, setIsNewPromo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState("");

  const supabase = createClient();

  const load = useCallback(async () => {
    const [{ data: svcData }, { data: promoData }] = await Promise.all([
      supabase
        .from("services")
        .select("id, name, price, currency, is_active")
        .order("name"),
      supabase
        .from("promotions")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    setServices(svcData || []);
    setPromotions((promoData as Promotion[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function updatePrice(id: string) {
    if (!newPrice) return;
    await supabase
      .from("services")
      .update({ price: Number(newPrice) })
      .eq("id", id);
    setEditingPrice(null);
    setNewPrice("");
    load();
  }

  async function savePromotion() {
    if (!editPromo?.code) return;
    setSaving(true);

    const payload = {
      code: editPromo.code,
      discount_type: editPromo.discount_type || "percentage",
      discount_value: editPromo.discount_value || 0,
      valid_from: editPromo.valid_from || new Date().toISOString().split("T")[0],
      valid_until: editPromo.valid_until || "",
      is_active: editPromo.is_active ?? true,
      max_uses: editPromo.max_uses || null,
    };

    if (isNewPromo) {
      await supabase.from("promotions").insert(payload);
    } else {
      await supabase
        .from("promotions")
        .update(payload)
        .eq("id", editPromo.id!);
    }

    setEditPromo(null);
    setSaving(false);
    load();
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
        <h1 className="text-2xl font-bold md:text-3xl">Pricing & Promotions</h1>
        <p className="text-muted-foreground">
          Manage service prices and promotional discounts
        </p>
      </div>

      {/* Service Prices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Service Prices
          </CardTitle>
          <CardDescription>Click on a price to edit it</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((svc) => (
                  <TableRow key={svc.id}>
                    <TableCell className="font-medium">{svc.name}</TableCell>
                    <TableCell>
                      {editingPrice === svc.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            className="w-28 h-8"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            autoFocus
                          />
                          <Button size="sm" onClick={() => updatePrice(svc.id)}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingPrice(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <span>${svc.price.toLocaleString()} {svc.currency}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={svc.is_active ? "default" : "secondary"}>
                        {svc.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingPrice(svc.id);
                          setNewPrice(String(svc.price));
                        }}
                      >
                        Edit Price
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {services.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No services found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Promotions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Promotions
            </CardTitle>
            <CardDescription>Discount codes and promotional offers</CardDescription>
          </div>
          <Button
            onClick={() => {
              setEditPromo({
                code: "",
                discount_type: "percentage",
                discount_value: 10,
                valid_from: new Date().toISOString().split("T")[0],
                valid_until: "",
                is_active: true,
                max_uses: null,
              });
              setIsNewPromo(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Promotion
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell className="font-mono font-medium">{promo.code}</TableCell>
                    <TableCell>
                      {promo.discount_type === "percentage"
                        ? `${promo.discount_value}%`
                        : `$${promo.discount_value}`}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(promo.valid_from).toLocaleDateString("en-CA")} —{" "}
                      {promo.valid_until
                        ? new Date(promo.valid_until).toLocaleDateString("en-CA")
                        : "No end"}
                    </TableCell>
                    <TableCell>
                      {promo.used_count}
                      {promo.max_uses ? ` / ${promo.max_uses}` : ""}
                    </TableCell>
                    <TableCell>
                      <Badge variant={promo.is_active ? "default" : "secondary"}>
                        {promo.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditPromo({ ...promo });
                          setIsNewPromo(false);
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {promotions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No promotions yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Promotion Editor Dialog */}
      <Dialog open={!!editPromo} onOpenChange={() => setEditPromo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNewPromo ? "New Promotion" : "Edit Promotion"}</DialogTitle>
            <DialogDescription>
              {isNewPromo ? "Create a discount code" : `Editing: ${editPromo?.code}`}
            </DialogDescription>
          </DialogHeader>
          {editPromo && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Promo Code</Label>
                <Input
                  value={editPromo.code || ""}
                  onChange={(e) =>
                    setEditPromo({ ...editPromo, code: e.target.value.toUpperCase() })
                  }
                  placeholder="SAVE20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select
                    value={editPromo.discount_type || "percentage"}
                    onValueChange={(v) =>
                      setEditPromo({
                        ...editPromo,
                        discount_type: v as "percentage" | "fixed",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Discount Value</Label>
                  <Input
                    type="number"
                    value={editPromo.discount_value || 0}
                    onChange={(e) =>
                      setEditPromo({
                        ...editPromo,
                        discount_value: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valid From</Label>
                  <Input
                    type="date"
                    value={editPromo.valid_from || ""}
                    onChange={(e) =>
                      setEditPromo({ ...editPromo, valid_from: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valid Until</Label>
                  <Input
                    type="date"
                    value={editPromo.valid_until || ""}
                    onChange={(e) =>
                      setEditPromo({ ...editPromo, valid_until: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Max Uses (blank = unlimited)</Label>
                <Input
                  type="number"
                  value={editPromo.max_uses ?? ""}
                  onChange={(e) =>
                    setEditPromo({
                      ...editPromo,
                      max_uses: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={editPromo.is_active ?? true}
                  onCheckedChange={(checked) =>
                    setEditPromo({ ...editPromo, is_active: checked })
                  }
                />
                <Label>Active</Label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditPromo(null)}>
                  Cancel
                </Button>
                <Button onClick={savePromotion} disabled={saving}>
                  {saving ? "Saving..." : isNewPromo ? "Create" : "Update"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
