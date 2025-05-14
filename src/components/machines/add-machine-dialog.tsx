import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddMachineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: any) => void;
}

export function AddMachineDialog({ open, onOpenChange, onSubmit }: AddMachineDialogProps) {
  const [form, setForm] = useState({
    machineId: 0,
    machineName: "",
    capacity: "",
    configuration: "",
    machineColor: "",
    active: 1,
    updDatetime: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onSubmit?.({ ...form });
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Machine</DialogTitle>
          <DialogDescription>Fill in the details below to add a new machine.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="machineName" placeholder="Machine Name" value={form.machineName} onChange={handleChange} required />
          <Input name="capacity" placeholder="Capacity" value={form.capacity} onChange={handleChange} required />
          <Input name="configuration" placeholder="Configuration" value={form.configuration} onChange={handleChange} required />
          <Input name="machineColor" placeholder="Color" value={form.machineColor} onChange={handleChange} required />
          <Input name="active" placeholder="Active (0 or 1)" value={form.active} onChange={handleChange} type="number" min={0} max={1} required />
          <DialogFooter>
            <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Machine"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}