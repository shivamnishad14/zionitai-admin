import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AdduserDialog } from '@/components/users/add-user-dialog'
import * as React from 'react'
import { ColumnDef } from "@tanstack/react-table"
import { useCallback, useMemo, useState } from "react"
import { DataTable } from '../ui/DataTable'
import { toast } from 'sonner'
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { User, useUserCount, useUsers, useUserMutations } from '@/hooks/useUserQueries'

// Constants
const DEFAULT_PAGE_SIZE = 10

// Memoized components
const ActiveStatus = React.memo(({ active }: { active: number }) => (
  <Badge variant={active === 1 ? "default" : "destructive"}>
    {active === 1 ? "Active" : "Inactive"}
  </Badge>
))
ActiveStatus.displayName = 'ActiveStatus'

// Table columns definition
const createColumns = (): ColumnDef<User>[] => [
  { 
    accessorKey: "userId", 
    header: "ID",
    cell: ({ row }) => <span className="font-medium">{row.original.userId}</span>
  },
  { 
    accessorKey: "username", 
    header: "Username",
    cell: ({ row }) => <span className="font-medium">{row.original.username}</span>
  },
  { 
    accessorKey: "firstName", 
    header: "First Name",
    cell: ({ row }) => <span>{row.original.firstName}</span>
  },
  { 
    accessorKey: "lastName", 
    header: "Last Name",
    cell: ({ row }) => <span>{row.original.lastName}</span>
  },
  { 
    accessorKey: "emailId", 
    header: "Email",
    cell: ({ row }) => <span>{row.original.emailId}</span>
  },
  { 
    accessorKey: "role.roleName", 
    header: "Role",
    cell: ({ row }) => <span>{row.original.role?.roleName || ''}</span>
  },
  { 
    accessorKey: "active", 
    header: "Status",
    cell: ({ row }) => <ActiveStatus active={row.original.active} />
  },
]

export function UserInventoryPage() {
  // State management
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE)

  // React Query hooks
  const { data: totalItems = 0, isLoading: isCountLoading } = useUserCount()
  const { 
    data: users = [], 
    isLoading: isUsersLoading,
    isFetching: isUsersFetching
  } = useUsers(currentPage, rowsPerPage)
  const { addMutation, updateMutation } = useUserMutations()

  // Memoized values
  const totalPages = useMemo(() => Math.ceil(totalItems / rowsPerPage), [totalItems, rowsPerPage])
  const columns = useMemo(() => createColumns(), [])

  // Handle page change with validation
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      // Validate that we're not trying to go to a page beyond available data
      if (page > 1 && totalItems > 0) {
        const maxPossiblePage = Math.ceil(totalItems / rowsPerPage)
        if (page > maxPossiblePage) {
          toast.error("Page number exceeds available data")
          return
        }
      }
      setCurrentPage(page)
    }
  }, [totalPages, totalItems, rowsPerPage])

  // Handle rows per page change with validation
  const handleRowsPerPageChange = useCallback((size: number) => {
    const newTotalPages = Math.ceil(totalItems / size)
    setRowsPerPage(size)
    // If current page would be invalid with new size, reset to page 1
    if (currentPage > newTotalPages) {
      setCurrentPage(1)
    }
  }, [totalItems, currentPage])

  // Handle user submit
  const handleUserSubmit = useCallback(async (form: User, mode: "add" | "edit") => {
    try {
      const mutation = mode === "add" ? addMutation : updateMutation
      const res = await mutation.mutateAsync(form)
      toast.success(res.message || (mode === "add" ? "User added!" : "User updated!"), { duration: 3000 })
      setIsDialogOpen(false)
      setSelectedUser(null)
    } catch (err) {
      toast.error("Error saving user", { duration: 3000 })
    }
  }, [addMutation, updateMutation])

  const handleOpenAddDialog = useCallback(() => {
    setDialogMode('add')
    setSelectedUser(null)
    setIsDialogOpen(true)
  }, [])

  const handleOpenEditDialog = useCallback((user: User) => {
    setDialogMode('edit')
    setSelectedUser(user)
    setIsDialogOpen(true)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false)
    setSelectedUser(null)
  }, [])

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-32">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Loading users...</span>
    </div>
  )

  // Memoized table props
  const tableProps = useMemo(() => ({
    data: users,
    columns,
    isLoading: isUsersLoading || isUsersFetching,
    addLabel: "Add User",
    onAddClick: handleOpenAddDialog,
    onEditClick: handleOpenEditDialog,
    page: currentPage,
    totalPages,
    setPage: handlePageChange,
    rowsPerPage,
    onRowsPerPageChange: handleRowsPerPageChange,
    pagination: true,
    showPagination: true,
    showRowsPerPage: true,
    showSearch: true,
    searchColumn: "username",
    searchPlaceholder: "Search by username..."
  }), [
    users,
    columns,
    isUsersLoading,
    isUsersFetching,
    handleOpenAddDialog,
    handleOpenEditDialog,
    currentPage,
    totalPages,
    handlePageChange,
    rowsPerPage,
    handleRowsPerPageChange,
  ])

  if (isCountLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Total Users: {totalItems}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              // Trigger a refetch of both queries
              addMutation.reset()
              updateMutation.reset()
            }}
            disabled={isUsersFetching}
          >
            {isUsersFetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              "Refresh"
            )}
          </Button>
          <Button onClick={handleOpenAddDialog}>Add User</Button>
        </div>
      </div>

      <AdduserDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        onSubmit={handleUserSubmit}
        initialData={selectedUser || undefined}
        mode={dialogMode}
      />

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {isUsersLoading || isUsersFetching ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="text-muted-foreground">
                {isCountLoading 
                  ? "Loading initial data..."
                  : `No users found ${currentPage > 1 ? `on page ${currentPage}` : ''}`}
              </div>
            ) : (
              `Showing ${users.length} users on page ${currentPage} of ${totalPages}`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isUsersLoading || isUsersFetching ? (
            <LoadingSpinner />
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                {currentPage > 1 
                  ? "No users found on this page. Try going back to the first page."
                  : "No users found. Add a new user to get started."}
              </p>
            </div>
          ) : (
            <DataTable {...tableProps} />
          )}
        </CardContent>
      </Card>
    </div>
  )
} 