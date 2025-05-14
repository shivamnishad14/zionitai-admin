import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Define Part type for props
export type Part = {
  machineId: number;
  machineName: string;
  capacity: string;
  configuration: string;
  machineColor: string;
  active: number;
  updDatetime: string;
};

interface AddOrEditPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Part, mode: "add" | "edit") => Promise<void>;
  initialData?: Partial<Part>;
  mode: "add" | "edit";
}

// Initial form state
const getInitialFormState = (initialData: Partial<Part> = {}): Part => ({
  machineId: initialData.machineId || 0,
  machineName: initialData.machineName || "",
  capacity: initialData.capacity || "",
  configuration: initialData.configuration || "",
  machineColor: initialData.machineColor || "",
  active: initialData.active ?? 1,
  updDatetime: initialData.updDatetime || new Date().toISOString(),
});

export function AddPartDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData = {},
  mode,
}: AddOrEditPartDialogProps) {
  // Use ref to track if component is mounted and prevent state updates after unmount
  const mounted = useRef(false);
  const initialDataRef = useRef(initialData);

  // Initialize form state
  const [form, setForm] = useState<Part>(() => getInitialFormState(initialData));
  const [loading, setLoading] = useState(false);

  // Set mounted ref on mount
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Only update form when dialog opens with new initialData
  useEffect(() => {
    if (!mounted.current || !open) return;

    // Only update if initialData has actually changed
    const currentInitialData = JSON.stringify(initialDataRef.current);
    const newInitialData = JSON.stringify(initialData);
    
    if (currentInitialData !== newInitialData) {
      initialDataRef.current = initialData;
      setForm(getInitialFormState(initialData));
    }
  }, [open, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!mounted.current) return;

    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mounted.current || loading) return;
    
    try {
      setLoading(true);
      await onSubmit(form, mode);
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    if (!mounted.current) return;
    onOpenChange(false);
  };

  // Don't render anything if dialog is closed
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Part" : "Update Part"}</DialogTitle>
          <DialogDescription>
            Fill in the details below to {mode === "add" ? "add a new" : "update the"} machine.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            name="machineName" 
            placeholder="Part Name" 
            value={form.machineName} 
            onChange={handleChange} 
            required={true}
          />
          <Input 
            name="capacity" 
            placeholder="Capacity" 
            value={form.capacity} 
            onChange={handleChange} 
            required={true}
          />
          <Input 
            name="configuration" 
            placeholder="Configuration" 
            value={form.configuration} 
            onChange={handleChange} 
            required={true}
          />
          <Input 
            name="machineColor" 
            placeholder="Color" 
            value={form.machineColor} 
            onChange={handleChange} 
            required={true}
          />
          <Input 
            name="active" 
            placeholder="Active (0 or 1)" 
            value={form.active} 
            onChange={handleChange} 
            type="number" 
            min={0} 
            max={1} 
            required={true}
          />
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? (mode === "add" ? "Adding..." : "Updating...") : (mode === "add" ? "Add Part" : "Update Part")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}