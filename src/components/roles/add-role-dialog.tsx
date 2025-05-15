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
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Role } from "@/hooks/useRoleQueries"

// Form validation schema
const roleFormSchema = z.object({
  roleName: z.string().min(1, "Role name is required"),
  active: z.number().min(0).max(1),
})

type RoleFormValues = z.infer<typeof roleFormSchema>

interface AddRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (form: Role, mode: "add" | "edit") => Promise<void>
  initialData?: Role
  mode: "add" | "edit"
}

export function AddRoleDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: AddRoleDialogProps) {
  // Initialize form with default values
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      roleName: initialData?.roleName || "",
      active: typeof initialData?.active === 'number' ? initialData.active : 1,
    },
  })

  // Reset form when dialog opens/closes or initialData changes
  React.useEffect(() => {
    if (open) {
      form.reset({
        roleName: initialData?.roleName || "",
        active: typeof initialData?.active === 'number' ? initialData.active : 1,
      })
    }
  }, [open, initialData, form])

  const handleSubmit = async (values: RoleFormValues) => {
    const payload: Role = {
      roleId: initialData?.roleId || 0, // For add, it will be 0, for edit it will have the existing ID
      roleName: values.roleName,
      active: values.active,
    }
    await onSubmit(payload, mode)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Role" : "Edit Role"}</DialogTitle>
          <DialogDescription>
            {mode === "add" 
              ? "Add a new role to the system."
              : "Edit the role details."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="roleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter role name" {...field} />
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
                      Enable or disable this role
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
            <DialogFooter>
              <Button type="submit">
                {mode === "add" ? "Add Role" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 