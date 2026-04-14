"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon, Upload, Trash2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { ROOM_CATEGORIES, IMAGE_STATUS_COLORS } from "@/lib/constants";

interface PropertyOption {
  id: string;
  address: string;
  city: string;
}

interface PropertyImage {
  id: string;
  property_id: string;
  room_category: string;
  image_url: string;
  status: string;
  validation_notes: string | null;
  sort_order: number;
  uploaded_at: string;
}

const IMAGE_RULES = [
  "Minimum resolution: 1920×1080 pixels",
  "Landscape orientation preferred",
  "Natural lighting — avoid flash",
  "Clean and decluttered spaces",
  "No personal items or identifiable information",
];

export default function ImagesPage() {
  const searchParams = useSearchParams();
  const preselectedProperty = searchParams.get("property");

  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>(preselectedProperty || "");
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(ROOM_CATEGORIES[0]);

  const supabase = createClient();

  useEffect(() => {
    async function loadProperties() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("properties")
        .select("id, address, city")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      setProperties(data || []);

      if (!selectedProperty && data && data.length > 0) {
        setSelectedProperty(data[0].id);
      }
      setLoading(false);
    }
    loadProperties();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedProperty) return;
    loadImages();
  }, [selectedProperty]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadImages() {
    const { data } = await supabase
      .from("property_images")
      .select("*")
      .eq("property_id", selectedProperty)
      .order("room_category")
      .order("sort_order");

    setImages(data || []);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedProperty) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `properties/${selectedProperty}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("property-images")
        .getPublicUrl(path);

      await supabase.from("property_images").insert({
        property_id: selectedProperty,
        room_category: selectedRoom,
        image_url: publicUrl,
        original_filename: file.name,
        file_size_bytes: file.size,
        status: "pending",
        sort_order: images.filter((i) => i.room_category === selectedRoom).length,
      });

      await loadImages();
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(imageId: string) {
    if (!confirm("Delete this image?")) return;

    await supabase.from("property_images").delete().eq("id", imageId);
    setImages((prev) => prev.filter((i) => i.id !== imageId));
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  // Group images by room category
  const groupedImages = ROOM_CATEGORIES.reduce<Record<string, PropertyImage[]>>(
    (acc, cat) => {
      const catImages = images.filter((i) => i.room_category === cat);
      if (catImages.length > 0) acc[cat] = catImages;
      return acc;
    },
    {}
  );

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
        <h1 className="text-3xl font-bold">Image Gallery</h1>
        <p className="text-muted-foreground">
          Manage room-by-room images for your properties
        </p>
      </div>

      {/* 5-Rule Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Photography Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {IMAGE_RULES.map((rule, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                {rule}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-8 text-center">
            <ImageIcon className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              No properties found. Register a property first to upload images.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Property selector + upload */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Property</Label>
              <Select value={selectedProperty} onValueChange={(v) => v && setSelectedProperty(v)}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.address}, {p.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Room Category</Label>
              <Select value={selectedRoom} onValueChange={(v) => v && setSelectedRoom(v)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Button
                disabled={uploading || !selectedProperty}
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Uploading..." : "Upload Image"}
              </Button>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </div>
          </div>

          {/* Image grid grouped by room */}
          {Object.keys(groupedImages).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-8 text-center">
                <ImageIcon className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No images uploaded for this property yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedImages).map(([category, catImages]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-base">{category}</CardTitle>
                  <CardDescription>{catImages.length} image(s)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {catImages.map((img) => {
                      const colors = IMAGE_STATUS_COLORS[img.status] || IMAGE_STATUS_COLORS.pending;
                      return (
                        <div key={img.id} className="group relative rounded-md border overflow-hidden">
                          <div className="aspect-video bg-muted">
                            <img
                              src={img.image_url}
                              alt={`${category} photo`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="p-2 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {statusIcon(img.status)}
                              <Badge className={`${colors.bg} ${colors.text} text-xs`}>
                                {img.status}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                              onClick={() => handleDelete(img.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                          </div>
                          {img.validation_notes && (
                            <p className="px-2 pb-2 text-xs text-muted-foreground">
                              {img.validation_notes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </>
      )}
    </div>
  );
}
