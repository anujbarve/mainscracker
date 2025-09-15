"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { IconUserCheck, IconUserX } from "@tabler/icons-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth";

type FacultyAvailabilityToggleProps = {
  isAvailable: boolean;
  onToggle: () => void;
};

export function FacultyAvailabilityToggle({ isAvailable, onToggle }: FacultyAvailabilityToggleProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateProfile } = useAuthStore();

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);
    
    try {
      await updateProfile({ is_available: checked });
      
      toast.success(
        checked 
          ? "You are now available for new assignments" 
          : "You are now unavailable for new assignments"
      );
      
      // Refresh the profile to get updated data
      onToggle();
    } catch (error) {
      toast.error("Failed to update availability status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center space-x-2">
        <Switch
          id="availability-toggle"
          checked={isAvailable}
          onCheckedChange={handleToggle}
          disabled={isUpdating}
        />
        <Label htmlFor="availability-toggle" className="text-sm font-medium">
          Available for assignments
        </Label>
      </div>
      
      <Badge 
        variant={isAvailable ? "default" : "secondary"}
        className="flex items-center gap-1"
      >
        {isAvailable ? (
          <>
            <IconUserCheck className="size-3" />
            Available
          </>
        ) : (
          <>
            <IconUserX className="size-3" />
            Unavailable
          </>
        )}
      </Badge>
    </div>
  );
}
