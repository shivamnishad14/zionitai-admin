import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/api/client";
import { FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Switch } from "@/components/ui/switch"


// Define Customer type for props
export type Customer = {
  customerId: number;
  customerName: string;
  address: string;
  pincode: string;
  ph_number: string;
  city: string;
  active: number;
  addDatetime: string;
};

interface AddOrEditCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Customer, mode: "add" | "edit") => Promise<void>;
  initialData?: Partial<Customer>;
  mode: "add" | "edit";
}

// Initial form state
const getInitialFormState = (initialData: Partial<Customer> = {}): Customer => ({
  customerId: initialData.customerId || 0,
  customerName: initialData.customerName || "",
  address: initialData.address || "",
  pincode: initialData.pincode || "",
  ph_number: initialData.ph_number || "",
  city: initialData.city || "",
  active: initialData.active ?? 1,
  addDatetime: initialData.addDatetime || new Date().toISOString(),
});

export function AddCustomerDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData = {},
  mode,
}: AddOrEditCustomerDialogProps) {
  // Use ref to track if component is mounted and prevent state updates after unmount
  const mounted = useRef(false);
  const initialDataRef = useRef(initialData);

  // Initialize form state
  const [form, setForm] = useState<Customer>(() => getInitialFormState(initialData));
  const [loading, setLoading] = useState(false);
  // Validation state
  const [nameChecking, setNameChecking] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameValid, setNameValid] = useState(false);
  const nameCheckTimeout = useRef<NodeJS.Timeout | null>(null);

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

  // Real-time customer name validation
  useEffect(() => {
    if (!open) return;
    if (!form.customerName || form.customerName === initialData.customerName) {
      setNameError(null);
      setNameValid(true);
      return;
    }
    setNameValid(false);
    setNameError(null);
    setNameChecking(true);
    if (nameCheckTimeout.current) clearTimeout(nameCheckTimeout.current);
    nameCheckTimeout.current = setTimeout(async () => {
      try {
        const data = await apiFetch(`/customer/checkcustomerName?customerName=${encodeURIComponent(form.customerName)}`) as any;
        if (data.code === 500) {
          setNameError(data.message || "Already Exists");
          setNameValid(false);
        } else {
          setNameError(null);
          setNameValid(true);
        }
      } catch (e) {
        setNameError("Error checking name");
        setNameValid(false);
      } finally {
        setNameChecking(false);
      }
    }, 500); // debounce
    return () => {
      if (nameCheckTimeout.current) clearTimeout(nameCheckTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.customerName, open]);

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
    if (!nameValid) return; // Prevent submit if name is not valid
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
          <DialogTitle>{mode === "add" ? "Add New Customer" : "Update Customer"}</DialogTitle>
          <DialogDescription>
            Fill in the details below to {mode === "add" ? "add a new" : "update the"} customer.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              name="customerName"
              placeholder="Customer Name"
              value={form.customerName}
              onChange={handleChange}
              required={true}
              disabled={loading}
            />
            {nameChecking && (
              <div className="flex items-center text-xs text-muted-foreground mt-1"><Loader2 className="h-3 w-3 animate-spin mr-1" />Checking name...</div>
            )}
            {nameError && (
              <div className="text-xs text-red-500 mt-1">{nameError}</div>
            )}
            {nameValid && !nameError && form.customerName && (
              <div className="text-xs text-green-600 mt-1">Name is available</div>
            )}
          </div>
          <Input
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            required={true}
            disabled={loading}
          />
          <Input
            name="pincode"
            placeholder="Pincode"
            value={form.pincode}
            onChange={handleChange}
            required={true}
            disabled={loading}
          />
          <Input
            name="ph_number"
            placeholder="Phone Number"
            value={form.ph_number}
            onChange={handleChange}
            required={true}
            disabled={loading}
          />
          <Input
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            required={true}
            disabled={loading}
          />
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <span className="text-base">Active Status</span>
              <div className="text-sm text-muted-foreground">
                Enable or disable this customer
              </div>
            </div>
            <Switch
              checked={form.active === 1}
              onCheckedChange={checked => setForm(prev => ({ ...prev, active: checked ? 1 : 0 }))}
              disabled={loading}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !nameValid}>
              {loading ? (mode === "add" ? "Adding..." : "Updating...") : (mode === "add" ? "Add Customer" : "Update Customer")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}