"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Cropper, { type Area } from "react-easy-crop";
import { toast } from "sonner";
import { ImageUp, Upload } from "lucide-react";
import { updateAvatar } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const OUTPUT_SIZE = 256;

async function getCroppedDataUrl(
  imageSrc: string,
  crop: Area,
): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image.");

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  );

  return canvas.toDataURL("image/jpeg", 0.85);
}

export function AvatarCropper({ hasAvatar }: { hasAvatar: boolean }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [isPending, startTransition] = useTransition();

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedArea(areaPixels);
  }, []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setOpen(true);
    });
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleSave() {
    if (!imageSrc || !croppedArea) return;
    startTransition(async () => {
      try {
        const dataUrl = await getCroppedDataUrl(imageSrc, croppedArea);
        const result = await updateAvatar(dataUrl);
        if (result.ok) {
          toast.success("Profile photo updated.");
          setOpen(false);
          setImageSrc(null);
          router.refresh();
        } else {
          toast.error(result.error ?? "Could not update your photo.");
        }
      } catch {
        toast.error("Could not process that image.");
      }
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await updateAvatar(null);
      if (result.ok) {
        toast.success("Profile photo removed.");
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not remove your photo.");
      }
    });
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
        >
          <ImageUp className="size-4" />
          {hasAvatar ? "Change photo" : "Upload photo"}
        </Button>
        {hasAvatar && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isPending}
          >
            Remove
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust your photo</DialogTitle>
            <DialogDescription>
              Drag to reposition and use the slider to zoom.
            </DialogDescription>
          </DialogHeader>

          <div className="relative h-72 w-full overflow-hidden rounded-xl bg-muted">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
              aria-label="Zoom"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isPending}>
              <Upload className="size-4" />
              Save photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
