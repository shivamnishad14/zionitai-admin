import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { MachineComponent, ComponentType, MachineType } from "@/hooks/useMachinePartQueries"
import { Loader2 } from "lucide-react"

// Form validation schema
const machineComponentFormSchema = z.object({
  machineComponentId: z.number().optional(),
  componentId: z.number().min(1, "Component ID is required"),
  componentName: z.string().min(1, "Component name is required"),
  componentCode: z.string().min(1, "Component code is required"),
  componentConfiguration: z.string().min(1, "Component configuration is required"),
  machineId: z.number().min(1, "Machine ID is required"),
  machineName: z.string().min(1, "Machine name is required"),
  capacity: z.string().min(1, "Capacity is required"),
  machineConfiguration: z.string().min(1, "Machine configuration is required"),
  machineColor: z.string().min(1, "Machine color is required"),
  active: z.number().min(0).max(1),
})

type MachineComponentFormValues = z.infer<typeof machineComponentFormSchema>

interface AddMachineComponentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (form: MachineComponent, mode: "add" | "edit") => Promise<void>
  initialData?: MachineComponent
  mode: "add" | "edit"
}

export function AddMachineComponentDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: AddMachineComponentDialogProps) {
  // Initialize form with default values
  const form = useForm<MachineComponentFormValues>({
    resolver: zodResolver(machineComponentFormSchema),
    defaultValues: {
      machineComponentId: initialData?.machineComponentId || 0,
      componentId: initialData?.component?.componentId || 0,
      componentName: initialData?.component?.componentName || "",
      componentCode: initialData?.component?.componentCode || "",
      componentConfiguration: initialData?.component?.configuration || "",
      machineId: initialData?.machine?.machineId || 0,
      machineName: initialData?.machine?.machineName || "",
      capacity: initialData?.machine?.capacity || "",
      machineConfiguration: initialData?.machine?.configuration || "",
      machineColor: initialData?.machine?.machineColor || "",
      active: typeof initialData?.machine?.active === 'number' ? initialData.machine.active : 1,
    },
  })

  // Reset form when dialog opens/closes or initialData changes
  React.useEffect(() => {
    if (open) {
      form.reset({
        machineComponentId: initialData?.machineComponentId || 0,
        componentId: initialData?.component?.componentId || 0,
        componentName: initialData?.component?.componentName || "",
        componentCode: initialData?.component?.componentCode || "",
        componentConfiguration: initialData?.component?.configuration || "",
        machineId: initialData?.machine?.machineId || 0,
        machineName: initialData?.machine?.machineName || "",
        capacity: initialData?.machine?.capacity || "",
        machineConfiguration: initialData?.machine?.configuration || "",
        machineColor: initialData?.machine?.machineColor || "",
        active: typeof initialData?.machine?.active === 'number' ? initialData.machine.active : 1,
      })
    }
  }, [open, initialData, form])

  const handleSubmit = async (values: MachineComponentFormValues) => {
    const payload: MachineComponent = {
      machineComponentId: values.machineComponentId || 0,
      component: {
        componentId: values.componentId,
        componentName: values.componentName,
        configuration: values.componentConfiguration,
        componentCode: values.componentCode,
      },
      machine: {
        machineId: values.machineId,
        machineName: values.machineName,
        capacity: values.capacity,
        configuration: values.machineConfiguration,
        machineColor: values.machineColor,
        active: values.active,
        updDatetime: new Date().toISOString(),
      },
    }
    await onSubmit(payload, mode)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Machine Component" : "Edit Machine Component"}</DialogTitle>
          <DialogDescription>
            {mode === "add" 
              ? "Add a new machine component to the system."
              : "Edit the machine component details."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="componentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Component ID</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter component ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="componentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Component Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter component name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="componentCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Component Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter component code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="componentConfiguration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Component Configuration</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter component configuration" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="machineId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Machine ID</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter machine ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="machineName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Machine Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter machine name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter capacity" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="machineConfiguration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Machine Configuration</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter machine configuration" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="machineColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Machine Color</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter machine color" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable or disable this machine
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={Number(field.value) === 1}
                        onCheckedChange={(checked) => field.onChange(Number(checked))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">
                {mode === "add" ? "Add Machine Component" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 