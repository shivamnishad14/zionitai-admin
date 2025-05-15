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
// import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// Component type definition
export interface Component {
  componentId: number
  componentName: string
  configuration: string
}

// Form validation schema
const componentFormSchema = z.object({
  componentName: z.string().min(1, "Component name is required"),
  configuration: z.string().min(1, "Configuration is required"),
})

type ComponentFormValues = z.infer<typeof componentFormSchema>

interface AddComponentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (form: Component, mode: "add" | "edit") => Promise<void>
  initialData?: Component
  mode: "add" | "edit"
}

export function AddComponentDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: AddComponentDialogProps) {
  // Initialize form with default values
  const form = useForm<ComponentFormValues>({
    resolver: zodResolver(componentFormSchema),
    defaultValues: {
      componentName: initialData?.componentName || "",
      configuration: initialData?.configuration || "",
    },
  })

  // Reset form when dialog opens/closes or initialData changes
  React.useEffect(() => {
    if (open) {
      form.reset({
        componentName: initialData?.componentName || "",
        configuration: initialData?.configuration || "",
      })
    }
  }, [open, initialData, form])

  const handleSubmit = async (values: ComponentFormValues) => {
    const payload: Component = {
      componentId: initialData?.componentId || 0, // For add, it will be 0, for edit it will have the existing ID
      componentName: values.componentName,
      configuration: values.configuration,
    }
    await onSubmit(payload, mode)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Component" : "Edit Component"}</DialogTitle>
          <DialogDescription>
            {mode === "add" 
              ? "Add a new component to the inventory."
              : "Edit the component details."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
              name="configuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Configuration</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter component configuration"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">
                {mode === "add" ? "Add Component" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 