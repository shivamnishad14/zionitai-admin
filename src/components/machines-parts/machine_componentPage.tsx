import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddMachineComponentDialog } from '@/components/machines-parts/add-machine_component-dialog'
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { DataTable } from '../ui/DataTable'
import { toast } from 'sonner'
import { Loader2 } from "lucide-react"
import { MachineComponent, useMachineComponentCount, useMachineComponents, useMachineComponentMutations } from '@/hooks/useMachinePartQueries'

// Constants
const DEFAULT_PAGE_SIZE = 10;

// Table columns definition
const createColumns = (): ColumnDef<MachineComponent>[] => [
  { 
    accessorKey: "machineComponentId", 
    header: "ID",
    cell: ({ row }) => <span className="font-medium">{row.original.machineComponentId}</span>
  },
  { 
    accessorKey: "component.componentName", 
    header: "Component Name",
    cell: ({ row }) => <span>{row.original.component.componentName}</span>
  },
  { 
    accessorKey: "component.componentCode", 
    header: "Component Code",
    cell: ({ row }) => <span>{row.original.component.componentCode}</span>
  },
  { 
    accessorKey: "component.configuration", 
    header: "Component Config",
    cell: ({ row }) => <span>{row.original.component.configuration}</span>
  },
  { 
    accessorKey: "machine.machineName", 
    header: "Machine Name",
    cell: ({ row }) => <span>{row.original.machine.machineName}</span>
  },
  { 
    accessorKey: "machine.capacity", 
    header: "Capacity",
    cell: ({ row }) => <span>{row.original.machine.capacity}</span>
  },
  { 
    accessorKey: "machine.configuration", 
    header: "Machine Config",
    cell: ({ row }) => <span>{row.original.machine.configuration}</span>
  },
  { 
    accessorKey: "machine.machineColor", 
    header: "Color",
    cell: ({ row }) => <span>{row.original.machine.machineColor}</span>
  },
  { 
    accessorKey: "machine.active", 
    header: "Active",
    cell: ({ row }) => <span>{row.original.machine.active === 1 ? 'Active' : 'Inactive'}</span>
  },
];

export function MachineComponentPage() {
  // State management
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedMachineComponent, setSelectedMachineComponent] = useState<MachineComponent | null>(null);

  // React Query hooks
  const { data: totalItems = 0, isLoading: isCountLoading } = useMachineComponentCount();
  const { 
    data: machineComponents = [], 
    isLoading: isMachineComponentsLoading,
    isFetching: isMachineComponentsFetching
  } = useMachineComponents();
  const { addMutation, updateMutation } = useMachineComponentMutations();

  // Memoized values
  const columns = useMemo(() => createColumns(), []);

  // Pagination (client-side, since API returns all)
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const totalPages = useMemo(() => Math.ceil(machineComponents.length / rowsPerPage), [machineComponents.length, rowsPerPage]);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return machineComponents.slice(start, start + rowsPerPage);
  }, [machineComponents, currentPage, rowsPerPage]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  // Handle rows per page change
  const handleRowsPerPageChange = useCallback((size: number) => {
    const newTotalPages = Math.ceil(machineComponents.length / size);
    setRowsPerPage(size);
    if (currentPage > newTotalPages) {
      setCurrentPage(1);
    }
  }, [machineComponents.length, currentPage]);

  // Handle submit
  const handleMachineComponentSubmit = useCallback(async (form: MachineComponent, mode: "add" | "edit") => {
    try {
      const mutation = mode === "add" ? addMutation : updateMutation;
      const res = await mutation.mutateAsync(form);
      toast.success(res.message || (mode === "add" ? "Machine Component added!" : "Machine Component updated!"), { duration: 3000 });
      setIsDialogOpen(false);
      setSelectedMachineComponent(null);
    } catch (err) {
      toast.error("Error saving machine component", { duration: 3000 });
    }
  }, [addMutation, updateMutation]);

  const handleOpenAddDialog = useCallback(() => {
    setDialogMode('add');
    setSelectedMachineComponent(null);
    setIsDialogOpen(true);
  }, []);

  const handleOpenEditDialog = useCallback((mc: MachineComponent) => {
    setDialogMode('edit');
    setSelectedMachineComponent(mc);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedMachineComponent(null);
  }, []);

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-32">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Loading machine components...</span>
    </div>
  );

  // Memoized table props
  const tableProps = useMemo(() => ({
    data: paginatedData,
    columns,
    isLoading: isMachineComponentsLoading || isMachineComponentsFetching,
    addLabel: "Add Machine Component",
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
    searchColumn: "component.componentName",
    searchPlaceholder: "Search by component name..."
  }), [
    paginatedData,
    columns,
    isMachineComponentsLoading,
    isMachineComponentsFetching,
    handleOpenAddDialog,
    handleOpenEditDialog,
    currentPage,
    totalPages,
    handlePageChange,
    rowsPerPage,
    handleRowsPerPageChange,
  ]);

  if (isCountLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Machine Component Inventory</h1>
          <p className="text-muted-foreground">
            Total Machine Components: {totalItems}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              addMutation.reset();
              updateMutation.reset();
            }}
            disabled={isMachineComponentsFetching}
          >
            {isMachineComponentsFetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              "Refresh"
            )}
          </Button>
          <Button onClick={handleOpenAddDialog}>Add Machine Component</Button>
        </div>
      </div>

      <AddMachineComponentDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        onSubmit={handleMachineComponentSubmit}
        initialData={selectedMachineComponent || undefined}
        mode={dialogMode}
      />

      <Card>
        <CardHeader>
          <CardTitle>Machine Components</CardTitle>
          <CardDescription>
            {isMachineComponentsLoading || isMachineComponentsFetching ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading machine components...
              </div>
            ) : paginatedData.length === 0 ? (
              <div className="text-muted-foreground">
                {isCountLoading 
                  ? "Loading initial data..."
                  : `No machine components found ${currentPage > 1 ? `on page ${currentPage}` : ''}`}
              </div>
            ) : (
              `Showing ${paginatedData.length} machine components on page ${currentPage} of ${totalPages}`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isMachineComponentsLoading || isMachineComponentsFetching ? (
            <LoadingSpinner />
          ) : paginatedData.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                {currentPage > 1 
                  ? "No machine components found on this page. Try going back to the first page."
                  : "No machine components found. Add a new machine component to get started."}
              </p>
            </div>
          ) : (
            <DataTable {...tableProps} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}