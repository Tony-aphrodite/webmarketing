"use client";

import { useEffect, useState } from "react";
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
import { Settings, RefreshCw } from "lucide-react";

interface MatchingConfig {
  // Tenant premium threshold
  premiumCriteriaThreshold: number;
  // Elite tier rent boundaries
  essentialsMin: number;
  essentialsMax: number;
  signatureMin: number;
  signatureMax: number;
  lujoMin: number;
  // PYMES score thresholds
  pymesModerateMax: number;
  pymesHighMax: number;
  pymesCriticalMin: number;
  // Owner tier thresholds
  preferredMinProperties: number;
  eliteMinProperties: number;
}

const DEFAULT_CONFIG: MatchingConfig = {
  premiumCriteriaThreshold: 3,
  essentialsMin: 2500,
  essentialsMax: 3999,
  signatureMin: 4000,
  signatureMax: 7000,
  lujoMin: 7001,
  pymesModerateMax: 15,
  pymesHighMax: 25,
  pymesCriticalMin: 26,
  preferredMinProperties: 2,
  eliteMinProperties: 4,
};

export default function AdminMatchingPage() {
  const [config, setConfig] = useState<MatchingConfig>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [previewStats, setPreviewStats] = useState<{
    premiumTenants: number;
    eliteProperties: number;
    signatureProperties: number;
    essentialsProperties: number;
  } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadConfig();
    loadPreview();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadConfig() {
    const { data } = await supabase
      .from("app_config")
      .select("key, value")
      .eq("category", "matching");

    if (data && data.length > 0) {
      const loaded: Partial<MatchingConfig> = {};
      for (const row of data) {
        if (row.key in DEFAULT_CONFIG) {
          (loaded as Record<string, number>)[row.key] = Number(row.value);
        }
      }
      setConfig({ ...DEFAULT_CONFIG, ...loaded });
    }
  }

  async function loadPreview() {
    const [
      { count: premiumTenants },
      { count: eliteProperties },
      { count: signatureProperties },
      { count: essentialsProperties },
    ] = await Promise.all([
      supabase
        .from("tenant_preferences")
        .select("*", { count: "exact", head: true })
        .eq("is_premium", true),
      supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("elite_tier", "lujo"),
      supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("elite_tier", "signature"),
      supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("elite_tier", "essentials"),
    ]);

    setPreviewStats({
      premiumTenants: premiumTenants || 0,
      eliteProperties: eliteProperties || 0,
      signatureProperties: signatureProperties || 0,
      essentialsProperties: essentialsProperties || 0,
    });
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    for (const [key, value] of Object.entries(config)) {
      await supabase.from("app_config").upsert(
        { category: "matching", key, value: String(value) },
        { onConflict: "category,key" }
      );
    }

    setMessage("Configuration saved successfully.");
    setSaving(false);
  }

  function updateField(key: keyof MatchingConfig, value: string) {
    setConfig((prev) => ({ ...prev, [key]: Number(value) || 0 }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Matching Configuration</h1>
          <p className="text-muted-foreground">
            Configure profiling thresholds and matching rules
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>

      {message && (
        <div className="rounded-md bg-green-100 p-3 text-sm text-green-800">
          {message}
        </div>
      )}

      {/* Preview Stats */}
      {previewStats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{previewStats.premiumTenants}</div>
              <p className="text-xs text-muted-foreground">Premium Tenants</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{previewStats.essentialsProperties}</div>
              <p className="text-xs text-muted-foreground">Essentials Properties</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{previewStats.signatureProperties}</div>
              <p className="text-xs text-muted-foreground">Signature Properties</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{previewStats.eliteProperties}</div>
              <p className="text-xs text-muted-foreground">Lujo Properties</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tenant Premium Criteria */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tenant Premium Criteria</CardTitle>
            <CardDescription>
              Minimum criteria count to qualify as a premium tenant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Minimum Criteria Met (out of 8)</Label>
              <Input
                type="number"
                min={1}
                max={8}
                value={config.premiumCriteriaThreshold}
                onChange={(e) => updateField("premiumCriteriaThreshold", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Elite Tier Rent Boundaries */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Elite Tier Rent Boundaries</CardTitle>
            <CardDescription>
              Monthly rent ranges for each Elite sub-tier (CAD)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Essentials Min</Label>
                <Input
                  type="number"
                  value={config.essentialsMin}
                  onChange={(e) => updateField("essentialsMin", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Essentials Max</Label>
                <Input
                  type="number"
                  value={config.essentialsMax}
                  onChange={(e) => updateField("essentialsMax", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Signature Min</Label>
                <Input
                  type="number"
                  value={config.signatureMin}
                  onChange={(e) => updateField("signatureMin", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Signature Max</Label>
                <Input
                  type="number"
                  value={config.signatureMax}
                  onChange={(e) => updateField("signatureMax", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Lujo Min</Label>
              <Input
                type="number"
                value={config.lujoMin}
                onChange={(e) => updateField("lujoMin", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Owner Tier Thresholds */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Owner Tier Thresholds</CardTitle>
            <CardDescription>
              Minimum property count for each owner tier
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Preferred Owners (min properties)</Label>
              <Input
                type="number"
                value={config.preferredMinProperties}
                onChange={(e) => updateField("preferredMinProperties", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Elite / Investor (min properties)</Label>
              <Input
                type="number"
                value={config.eliteMinProperties}
                onChange={(e) => updateField("eliteMinProperties", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* PYMES Score Thresholds */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">PYMES Urgency Thresholds</CardTitle>
            <CardDescription>
              Score ranges for each urgency level
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Moderate (max score)</Label>
              <Input
                type="number"
                value={config.pymesModerateMax}
                onChange={(e) => updateField("pymesModerateMax", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>High (max score)</Label>
              <Input
                type="number"
                value={config.pymesHighMax}
                onChange={(e) => updateField("pymesHighMax", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Critical (min score)</Label>
              <Input
                type="number"
                value={config.pymesCriticalMin}
                onChange={(e) => updateField("pymesCriticalMin", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
