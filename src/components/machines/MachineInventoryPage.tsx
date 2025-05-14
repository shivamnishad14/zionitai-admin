import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddMachineDialog, Machine } from '@/components/machines/add-machine-dialog'
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
  const [data, setData] = useState<Machine[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
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
      const count = await apiFetch<number>("/machine/getMachineCount", {
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
  const fetchMachines = useCallback(async (page: number, perPage: number, showLoading = true) => {
    if (showLoading) {
      setIsPageLoading(true);
    }
    
    try {
      const apiPage = Math.max(1, page);
      const response = await apiFetch<Machine[]>(
        `/machine/getListMachineByLimit?pageNo=${apiPage}&perPage=${perPage}`,
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
      console.error("Error fetching machines:", error);
      toast.error("Failed to fetch machines");
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
          await fetchMachines(1, rowsPerPage, false);
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
        await fetchMachines(currentPage, rowsPerPage);
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
  }, [currentPage, rowsPerPage, fetchMachines, isInitialLoading]);

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
      await fetchMachines(currentPage, rowsPerPage, false);
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchTotalCount, fetchMachines, currentPage, rowsPerPage]);

  // Handle machine submit
  const handleMachineSubmit = useCallback(async (form: Machine, mode: "add" | "edit") => {
    try {
      const endpoint = mode === "add" ? "/machine/addNewMachine" : "/machine/updateMachine";
      const res = await apiFetch<{ code: number; message: string }>(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      toast.success(res.message || (mode === "add" ? "Machine added!" : "Machine updated!"), { duration: 3000 });
      setIsDialogOpen(false);
      setSelectedMachine(null);
      
      // Refresh data
      await handleRefresh();
    } catch (err) {
      toast.error("Error saving machine", { duration: 3000 });
    }
  }, [handleRefresh]);

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
    data,
    columns,
    isLoading: isPageLoading,
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
          <h1 className="text-3xl font-bold tracking-tight">Machine Inventory</h1>
          <p className="text-muted-foreground">
            Total Machines: {totalItems}
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
            {isPageLoading ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading machines...
              </div>
            ) : data.length === 0 ? (
              <div className="text-muted-foreground">
                {isInitialLoading 
                  ? "Loading initial data..."
                  : `No machines found ${currentPage > 1 ? `on page ${currentPage}` : ''}`}
              </div>
            ) : (
              `Showing ${data.length} machines on page ${currentPage} of ${totalPages}`
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
                  ? "No machines found on this page. Try going back to the first page."
                  : "No machines found. Add a new machine to get started."}
              </p>
            </div>
          ) : (
            <DataTable {...tableProps} />
          )}
          This is Table row data 
          <p>{JSON.stringify(data)}</p>
        </CardContent>
      </Card>
    </div>
  );
}