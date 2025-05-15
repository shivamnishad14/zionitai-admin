import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddComponentDialog, Component } from '@/components/parts/add-component-dialog'
import * as React from 'react'
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { DataTable } from '../ui/DataTable'
import { toast } from 'sonner'
import { Loader2 } from "lucide-react"
import { useComponentCount, useComponents, useComponentMutations } from '@/hooks/useComponentQueries'

// Constants
const DEFAULT_PAGE_SIZE = 10;

// Table columns definition
const createColumns = (): ColumnDef<Component>[] => [
  { 
    accessorKey: "componentId", 
    header: "ID",
    cell: ({ row }) => <span className="font-medium">{row.original.componentId}</span>
  },
  { 
    accessorKey: "componentName", 
    header: "Name",
    cell: ({ row }) => <span className="font-medium">{row.original.componentName}</span>
  },
  { 
    accessorKey: "configuration", 
    header: "Configuration",
    cell: ({ row }) => <span>{row.original.configuration}</span>
  },
];

export function PartInventoryPage() {
  // State management
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);

  // React Query hooks
  const { data: totalItems = 0, isLoading: isCountLoading } = useComponentCount();
  const { 
    data: components = [], 
    isLoading: isComponentsLoading,
    isFetching: isComponentsFetching
  } = useComponents(currentPage, rowsPerPage);
  const { addMutation, updateMutation } = useComponentMutations();

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

  // Handle component submit
  const handleComponentSubmit = useCallback(async (form: Component, mode: "add" | "edit") => {
    try {
      const mutation = mode === "add" ? addMutation : updateMutation;
      const res = await mutation.mutateAsync(form);
      
      toast.success(res.message || (mode === "add" ? "Component added!" : "Component updated!"), { duration: 3000 });
      setIsDialogOpen(false);
      setSelectedComponent(null);
    } catch (err) {
      toast.error("Error saving component", { duration: 3000 });
    }
  }, [addMutation, updateMutation]);

  const handleOpenAddDialog = useCallback(() => {
    setDialogMode('add');
    setSelectedComponent(null);
    setIsDialogOpen(true);
  }, []);

  const handleOpenEditDialog = useCallback((component: Component) => {
    setDialogMode('edit');
    setSelectedComponent(component);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedComponent(null);
  }, []);

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-32">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Loading components...</span>
    </div>
  );

  // Memoized table props
  const tableProps = useMemo(() => ({
    data: components,
    columns,
    isLoading: isComponentsLoading || isComponentsFetching,
    addLabel: "Add Component",
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
    searchColumn: "componentName",
    searchPlaceholder: "Search by component name..."
  }), [
    components,
    columns,
    isComponentsLoading,
    isComponentsFetching,
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
          <h1 className="text-3xl font-bold tracking-tight">Component Inventory</h1>
          <p className="text-muted-foreground">
            Total Components: {totalItems}
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
            disabled={isComponentsFetching}
          >
            {isComponentsFetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              "Refresh"
            )}
          </Button>
          <Button onClick={handleOpenAddDialog}>Add Component</Button>
        </div>
      </div>

      <AddComponentDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        onSubmit={handleComponentSubmit}
        initialData={selectedComponent || undefined}
        mode={dialogMode}
      />

      <Card>
        <CardHeader>
          <CardTitle>Components</CardTitle>
          <CardDescription>
            {isComponentsLoading || isComponentsFetching ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading components...
              </div>
            ) : components.length === 0 ? (
              <div className="text-muted-foreground">
                {isCountLoading 
                  ? "Loading initial data..."
                  : `No components found ${currentPage > 1 ? `on page ${currentPage}` : ''}`}
              </div>
            ) : (
              `Showing ${components.length} components on page ${currentPage} of ${totalPages}`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isComponentsLoading || isComponentsFetching ? (
            <LoadingSpinner />
          ) : components.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                {currentPage > 1 
                  ? "No components found on this page. Try going back to the first page."
                  : "No components found. Add a new component to get started."}
              </p>
            </div>
          ) : (
            <DataTable {...tableProps} />
          )}
          <p>Data: {JSON.stringify(components)}</p>
        </CardContent>
      </Card>
    </div>
  );
}