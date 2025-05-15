import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddRoleDialog } from '@/components/roles/add-role-dialog'
import * as React from 'react'
import { ColumnDef } from "@tanstack/react-table"
import { useCallback, useMemo, useState } from "react"
import { DataTable } from '../ui/DataTable'
import { toast } from 'sonner'
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { Role, useRoleCount, useRoles, useRoleMutations } from '@/hooks/useRoleQueries'

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
const createColumns = (): ColumnDef<Role>[] => [
  { 
    accessorKey: "roleId", 
    header: "ID",
    cell: ({ row }) => <span className="font-medium">{row.original.roleId}</span>
  },
  { 
    accessorKey: "roleName", 
    header: "Name",
    cell: ({ row }) => <span className="font-medium">{row.original.roleName}</span>
  },
  { 
    accessorKey: "active", 
    header: "Status",
    cell: ({ row }) => <ActiveStatus active={row.original.active} />
  },
]

export function RoleInventoryPage() {
  // State management
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE)

  // React Query hooks
  const { data: totalItems = 0, isLoading: isCountLoading } = useRoleCount()
  const { 
    data: roles = [], 
    isLoading: isRolesLoading,
    isFetching: isRolesFetching
  } = useRoles(currentPage, rowsPerPage)
  const { addMutation, updateMutation } = useRoleMutations()

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

  // Handle role submit
  const handleRoleSubmit = useCallback(async (form: Role, mode: "add" | "edit") => {
    try {
      const mutation = mode === "add" ? addMutation : updateMutation
      const res = await mutation.mutateAsync(form)
      
      toast.success(res.message || (mode === "add" ? "Role added!" : "Role updated!"), { duration: 3000 })
      setIsDialogOpen(false)
      setSelectedRole(null)
    } catch (err) {
      toast.error("Error saving role", { duration: 3000 })
    }
  }, [addMutation, updateMutation])

  const handleOpenAddDialog = useCallback(() => {
    setDialogMode('add')
    setSelectedRole(null)
    setIsDialogOpen(true)
  }, [])

  const handleOpenEditDialog = useCallback((role: Role) => {
    setDialogMode('edit')
    setSelectedRole(role)
    setIsDialogOpen(true)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false)
    setSelectedRole(null)
  }, [])

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-32">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Loading roles...</span>
    </div>
  )

  // Memoized table props
  const tableProps = useMemo(() => ({
    data: roles,
    columns,
    isLoading: isRolesLoading || isRolesFetching,
    addLabel: "Add Role",
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
    searchColumn: "roleName",
    searchPlaceholder: "Search by role name..."
  }), [
    roles,
    columns,
    isRolesLoading,
    isRolesFetching,
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
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Total Roles: {totalItems}
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
            disabled={isRolesFetching}
          >
            {isRolesFetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              "Refresh"
            )}
          </Button>
          <Button onClick={handleOpenAddDialog}>Add Role</Button>
        </div>
      </div>

      <AddRoleDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        onSubmit={handleRoleSubmit}
        initialData={selectedRole || undefined}
        mode={dialogMode}
      />

      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
          <CardDescription>
            {isRolesLoading || isRolesFetching ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading roles...
              </div>
            ) : roles.length === 0 ? (
              <div className="text-muted-foreground">
                {isCountLoading 
                  ? "Loading initial data..."
                  : `No roles found ${currentPage > 1 ? `on page ${currentPage}` : ''}`}
              </div>
            ) : (
              `Showing ${roles.length} roles on page ${currentPage} of ${totalPages}`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isRolesLoading || isRolesFetching ? (
            <LoadingSpinner />
          ) : roles.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                {currentPage > 1 
                  ? "No roles found on this page. Try going back to the first page."
                  : "No roles found. Add a new role to get started."}
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