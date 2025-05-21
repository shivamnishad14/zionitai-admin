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
import { User, Role, checkUserName } from "@/hooks/useUserQueries"
import { Loader2 } from "lucide-react"

// Form validation schema
const userFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  emailId: z.string().email("Invalid email address"),
  active: z.number().min(0).max(1),
  roleId: z.number().min(1, "Role is required"),
})

type userFormValues = z.infer<typeof userFormSchema>

interface AdduserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (form: User, mode: "add" | "edit") => Promise<void>
  initialData?: User
  mode: "add" | "edit"
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function AdduserDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: AdduserDialogProps) {
  // Initialize form with default values
  const form = useForm<userFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: initialData?.username || "",
      password: initialData?.password || "",
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      emailId: initialData?.emailId || "",
      active: typeof initialData?.active === 'number' ? initialData.active : 1,
      roleId: initialData?.role?.roleId || 1,
    },
  })

  // Reset form when dialog opens/closes or initialData changes
  React.useEffect(() => {
    if (open) {
      form.reset({
        username: initialData?.username || "",
        password: initialData?.password || "",
        firstName: initialData?.firstName || "",
        lastName: initialData?.lastName || "",
        emailId: initialData?.emailId || "",
        active: typeof initialData?.active === 'number' ? initialData.active : 1,
        roleId: initialData?.role?.roleId || 1,
      })
    }
  }, [open, initialData, form])

  // Validation state
  const [nameChecking, setNameChecking] = React.useState(false);
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [nameValid, setNameValid] = React.useState(false);
  // Use debounced username
  const debouncedUsername = useDebounce(form.watch("username"), 500);

  // Real-time username validation
  React.useEffect(() => {
    if (!open) return;
    const username = debouncedUsername;
    if (!username || username === initialData?.username) {
      setNameError(null);
      setNameValid(true);
      return;
    }
    setNameValid(false);
    setNameError(null);
    setNameChecking(true);
    (async () => {
      try {
        const data = await checkUserName(username);
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
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedUsername, open]);

  const handleSubmit = async (values: userFormValues) => {
    if (!nameValid) return; // Prevent submit if name is not valid
    const payload: User = {
      userId: initialData?.userId || 0,
      username: values.username,
      password: values.password,
      newPassword: null,
      firstName: values.firstName,
      lastName: values.lastName,
      emailId: values.emailId,
      active: values.active,
      updDatetime: new Date().toISOString(),
      role: {
        roleId: values.roleId,
        roleName: '', // You may want to fetch roleName from a roles list
        active: 1,
      },
    }
    await onSubmit(payload, mode)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New User" : "Edit User"}</DialogTitle>
          <DialogDescription>
            {mode === "add" 
              ? "Add a new user to the system."
              : "Edit the user details."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} disabled={nameChecking} />
                  </FormControl>
                  {nameChecking && (
                    <div className="flex items-center text-xs text-muted-foreground mt-1"><Loader2 className="h-3 w-3 animate-spin mr-1" />Checking name...</div>
                  )}
                  {nameError && (
                    <div className="text-xs text-red-500 mt-1">{nameError}</div>
                  )}
                  {nameValid && !nameError && form.watch("username") && (
                    <div className="text-xs text-green-600 mt-1">Name is available</div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emailId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email" {...field} />
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
                      Enable or disable this user
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
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role ID</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter role ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={!nameValid}>
                {mode === "add" ? "Add User" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 