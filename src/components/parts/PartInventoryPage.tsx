import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddComponentDialog, Component } from '@/components/parts/add-component-dialog'
import * as React from 'react'
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/api/client";
import { DataTable } from '../ui/DataTable'
import { toast } from 'sonner'
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

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
  const [data, setData] = useState<Component[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Memoized values
  const totalPages = useMemo(() => Math.ceil(totalItems / rowsPerPage), [totalItems, rowsPerPage]);

  // Memoized columns
  const columns = useMemo(() => createColumns(), []);

  // Fetch total count with caching
  const fetchTotalCount = useCallback(async () => {
    try {
      const count = await apiFetch<number>("/component/getComponentCount", {
        // Add cache control to prevent duplicate calls
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      setTotalItems(count);
      return count;
    } catch (error) {
      console.error("Error fetching total count:", error);
      toast.error("Failed to fetch total count");
      setTotalItems(0);
      return 0;
    }
  }, []);

  // Fetch paginated data with proper caching and error handling
  const fetchComponents = useCallback(async (page: number, perPage: number, showLoading = true) => {
    if (showLoading) {
      setIsPageLoading(true);
    }
    
    try {
      const apiPage = Math.max(1, page);
      const response = await apiFetch<Component[]>(
        `/component/getListComponentByLimit?pageNo=${apiPage}&perPage=${perPage}`,
        {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      );
      
      if (response && Array.isArray(response)) {
        // Only update data if it's different
        setData(prevData => {
          if (JSON.stringify(prevData) === JSON.stringify(response)) {
            return prevData;
          }
          return response;
        });
        return response;
      } else {
        console.error("Invalid response format:", response);
        setData([]);
        toast.error("Invalid data received from server");
        return [];
      }
    } catch (error) {
      console.error("Error fetching components:", error);
      toast.error("Failed to fetch components");
      setData([]);
      return [];
    } finally {
      if (showLoading) {
        setIsPageLoading(false);
      }
    }
  }, []);

  // Initial data fetch - only once on mount
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const initializeData = async () => {
      if (!isMounted) return;
      
      setIsInitialLoading(true);
      try {
        const count = await fetchTotalCount();
        if (count > 0 && isMounted) {
          await fetchComponents(1, rowsPerPage, false);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to initialize data:", error);
          toast.error("Failed to initialize data");
        }
      } finally {
        if (isMounted) {
          setIsInitialLoading(false);
        }
      }
    };

    initializeData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []); // Empty dependency array as this should only run once

  // Handle page changes - simplified to prevent duplicate calls
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadPageData = async () => {
      if (!isMounted || isInitialLoading) return;

      try {
        await fetchComponents(currentPage, rowsPerPage);
      } catch (error) {
        if (isMounted) {
          console.error("Error during page change:", error);
        }
      }
    };

    loadPageData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [currentPage, rowsPerPage, fetchComponents, isInitialLoading]);

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
      // Batch state updates
      React.startTransition(() => {
        setIsPageLoading(true);
        setCurrentPage(page);
      });
    }
  }, [totalPages, totalItems, rowsPerPage]);

  // Handle rows per page change with validation
  const handleRowsPerPageChange = useCallback((size: number) => {
    const newTotalPages = Math.ceil(totalItems / size);
    // Batch state updates
    React.startTransition(() => {
      setIsPageLoading(true);
      setRowsPerPage(size);
      // If current page would be invalid with new size, reset to page 1
      if (currentPage > newTotalPages) {
        setCurrentPage(1);
      }
    });
  }, [totalItems, currentPage]);

  // Refresh data with proper error handling
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchTotalCount();
      await fetchComponents(currentPage, rowsPerPage, false);
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchTotalCount, fetchComponents, currentPage, rowsPerPage]);

  // Handle component submit
  const handleComponentSubmit = useCallback(async (form: Component, mode: "add" | "edit") => {
    try {
      const endpoint = mode === "add" ? "/component/addNewComponent" : "/component/updateComponent";
      const res = await apiFetch<{ code: number; message: string }>(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      toast.success(res.message || (mode === "add" ? "Component added!" : "Component updated!"), { duration: 3000 });
      setIsDialogOpen(false);
      setSelectedComponent(null);
      
      // Refresh data
      await handleRefresh();
    } catch (err) {
      toast.error("Error saving component", { duration: 3000 });
    }
  }, [handleRefresh]);

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
    data,
    columns,
    isLoading: isPageLoading,
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
    columns,
    isPageLoading,
    handleOpenAddDialog,
    handleOpenEditDialog,
    currentPage,
    totalPages,
    handlePageChange,
    rowsPerPage,
    handleRowsPerPageChange,
  ]);

  if (isInitialLoading) {
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
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
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
            {isPageLoading ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading components...
              </div>
            ) : data.length === 0 ? (
              <div className="text-muted-foreground">
                {isInitialLoading 
                  ? "Loading initial data..."
                  : `No components found ${currentPage > 1 ? `on page ${currentPage}` : ''}`}
              </div>
            ) : (
              `Showing ${data.length} components on page ${currentPage} of ${totalPages}`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPageLoading || isInitialLoading ? (
            <LoadingSpinner />
          ) : data.length === 0 ? (
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
        </CardContent>
      </Card>
    </div>
  );
}