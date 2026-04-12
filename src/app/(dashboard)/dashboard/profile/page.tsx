"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/types/database";

const ROLE_LABELS: Record<string, string> = {
  propietario: "Property Owner",
  propietario_preferido: "Preferred Owner",
  inversionista: "Investor",
  inquilino: "Tenant",
  inquilino_premium: "Premium Tenant",
  pymes: "Business Owner (SMB)",
  admin: "Administrator",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.get("full_name") as string,
        phone: (formData.get("phone") as string) || null,
      })
      .eq("id", profile.id);

    if (error) {
      setMessage("Failed to update profile. Please try again.");
    } else {
      setMessage("Profile updated successfully.");
      setProfile({
        ...profile,
        full_name: formData.get("full_name") as string,
        phone: (formData.get("phone") as string) || null,
      });
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your contact details
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {message && (
              <div
                className={`rounded-md p-3 text-sm ${
                  message.includes("Failed")
                    ? "bg-destructive/10 text-destructive"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {message}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" value={profile.email} disabled />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Account type</Label>
              <div>
                <Badge>{ROLE_LABELS[profile.role] || profile.role}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={profile.full_name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={profile.phone || ""}
                placeholder="+1 514 000 0000"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Member since:{" "}
              {new Date(profile.created_at).toLocaleDateString("en-CA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </CardContent>
          <div className="flex justify-end px-6 pb-6">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
