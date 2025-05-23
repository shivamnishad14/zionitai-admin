import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddMachineDialog, Machine } from '@/components/machines/add-machine-dialog'
import * as React from 'react'
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { DataTable } from '../ui/DataTable'
import { toast } from 'sonner'
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useMachineCount, useMachines, useMachineMutations } from '@/hooks/useMachineQueries'

// Constants
const DEFAULT_PAGE_SIZE = 10;
const DATE_FORMAT = 'MMM dd, yyyy HH:mm:ss';

// Utility functions
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), DATE_FORMAT);
  } catch (error) {
    return dateString;
  }
};

// Memoized components
const ActiveStatus = React.memo(({ active }: { active: number }) => (
  <Badge variant={active === 1 ? "default" : "destructive"}>
    {active === 1 ? "Active" : "Inactive"}
  </Badge>
));
ActiveStatus.displayName = 'ActiveStatus';

const ColorPreview = React.memo(({ color }: { color: string }) => (
  <div className="flex items-center gap-2">
    <div 
      className="w-4 h-4 rounded-full border" 
      style={{ backgroundColor: color }}
    />
    <span>{color}</span>
  </div>
));
ColorPreview.displayName = 'ColorPreview';

// Table columns definition
const createColumns = (): ColumnDef<Machine>[] => [
  { 
    accessorKey: "machineId", 
    header: "ID",
    cell: ({ row }) => <span className="font-medium">{row.original.machineId}</span>
  },
  { 
    accessorKey: "machineName", 
    header: "Name",
    cell: ({ row }) => <span className="font-medium">{row.original.machineName}</span>
  },
  { 
    accessorKey: "capacity", 
    header: "Capacity",
    cell: ({ row }) => <span>{row.original.capacity}</span>
  },
  { 
    accessorKey: "configuration", 
    header: "Configuration",
    cell: ({ row }) => <span>{row.original.configuration}</span>
  },
  { 
    accessorKey: "machineColor", 
    header: "Color",
    cell: ({ row }) => <ColorPreview color={row.original.machineColor} />
  },
  { 
    accessorKey: "active", 
    header: "Status",
    cell: ({ row }) => <ActiveStatus active={row.original.active} />
  },
  { 
    accessorKey: "updDatetime", 
    header: "Updated At",
    cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.updDatetime)}</span>
  },
];

export function MachineInventoryPage() {
  // State management
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);

  // React Query hooks
  const { data: totalItems = 0, isLoading: isCountLoading } = useMachineCount();
  const { 
    data: machines = [], 
    isLoading: isMachinesLoading,
    isFetching: isMachinesFetching
  } = useMachines(currentPage, rowsPerPage);
  const { addMutation, updateMutation } = useMachineMutations();

  // Memoized values
  const totalPages = useMemo(() => Math.ceil(totalItems / rowsPerPage), [totalItems, rowsPerPage]);
  const columns = useMemo(() => createColumns(), []);

  // Handle page change with validation
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      // Validate that we're not trying to go to a page beyond available data
      if (page > 1 && totalItems > 0) {
        const maxPossiblePage = Math.ceil(totalItems / rowsPerPage);
        if (page > maxPossiblePage) {
          toast.error("Page number exceeds available data");
          return;
        }
      }
      setCurrentPage(page);
    }
  }, [totalPages, totalItems, rowsPerPage]);

  // Handle rows per page change with validation
  const handleRowsPerPageChange = useCallback((size: number) => {
    const newTotalPages = Math.ceil(totalItems / size);
    setRowsPerPage(size);
    // If current page would be invalid with new size, reset to page 1
    if (currentPage > newTotalPages) {
      setCurrentPage(1);
    }
  }, [totalItems, currentPage]);

  // Handle machine submit
  const handleMachineSubmit = useCallback(async (form: Machine, mode: "add" | "edit") => {
    try {
      const mutation = mode === "add" ? addMutation : updateMutation;
      const res = await mutation.mutateAsync(form);
      
      toast.success(res.message || (mode === "add" ? "Machine added!" : "Machine updated!"), { duration: 3000 });
      setIsDialogOpen(false);
      setSelectedMachine(null);
    } catch (err) {
      toast.error("Error saving machine", { duration: 3000 });
    }
  }, [addMutation, updateMutation]);

  const handleOpenAddDialog = useCallback(() => {
    setDialogMode('add');
    setSelectedMachine(null);
    setIsDialogOpen(true);
  }, []);

  const handleOpenEditDialog = useCallback((machine: Machine) => {
    setDialogMode('edit');
    setSelectedMachine(machine);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedMachine(null);
  }, []);

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-32">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Loading machines...</span>
    </div>
  );

  // Memoized table props
  const tableProps = useMemo(() => ({
    data: machines,
    columns,
    isLoading: isMachinesLoading || isMachinesFetching,
    addLabel: "Add Machine",
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
    searchColumn: "machineName",
    searchPlaceholder: "Search by machine name..."
  }), [
    machines,
    columns,
    isMachinesLoading,
    isMachinesFetching,
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
          <h1 className="text-3xl font-bold tracking-tight">Machine Inventory</h1>
          <p className="text-muted-foreground">
            Total Machines: {totalItems}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              // Trigger a refetch of both queries
              addMutation.reset();
              updateMutation.reset();
            }}
            disabled={isMachinesFetching}
          >
            {isMachinesFetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              "Refresh"
            )}
          </Button>
          <Button onClick={handleOpenAddDialog}>Add Machine</Button>
        </div>
      </div>

        <AddMachineDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
          onSubmit={handleMachineSubmit}
        initialData={selectedMachine || undefined}
          mode={dialogMode}
        />

      <Card>
        <CardHeader>
          <CardTitle>Machines</CardTitle>
          <CardDescription>
            {isMachinesLoading || isMachinesFetching ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading machines...
              </div>
            ) : machines.length === 0 ? (
              <div className="text-muted-foreground">
                {isCountLoading 
                  ? "Loading initial data..."
                  : `No machines found ${currentPage > 1 ? `on page ${currentPage}` : ''}`}
              </div>
            ) : (
              `Showing ${machines.length} machines on page ${currentPage} of ${totalPages}`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isMachinesLoading || isMachinesFetching ? (
            <LoadingSpinner />
          ) : machines.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                {currentPage > 1 
                  ? "No machines found on this page. Try going back to the first page."
                  : "No machines found. Add a new machine to get started."}
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