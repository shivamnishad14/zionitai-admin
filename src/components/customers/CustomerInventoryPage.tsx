import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddCustomerDialog } from './add-customer-dialog'
import * as React from 'react'
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { DataTable } from '../ui/DataTable'
import { toast } from 'sonner'
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Customer, useCustomers, useCustomerCount, useCustomerMutations } from '@/hooks/useCustomerQueries'

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
const createColumns = (): ColumnDef<Customer>[] => [
  { accessorKey: "customerId", header: "ID", cell: ({ row }) => <span className="font-medium">{row.original.customerId}</span> },
  { accessorKey: "customerName", header: "Name", cell: ({ row }) => <span className="font-medium">{row.original.customerName}</span> },
  { accessorKey: "address", header: "Address", cell: ({ row }) => <span>{row.original.address}</span> },
  { accessorKey: "pincode", header: "Pincode", cell: ({ row }) => <span>{row.original.pincode}</span> },
  { accessorKey: "ph_number", header: "Phone", cell: ({ row }) => <span>{row.original.ph_number}</span> },
  { accessorKey: "city", header: "City", cell: ({ row }) => <span>{row.original.city}</span> },
  { accessorKey: "active", header: "Status", cell: ({ row }) => <ActiveStatus active={row.original.active} /> },
  { accessorKey: "addDatetime", header: "Added At", cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.addDatetime)}</span> },
];

export function CustomerInventoryPage() {
  // State management
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);

  // React Query hooks
  const { data: totalItems = 0, isLoading: isCountLoading } = useCustomerCount();
  const { 
    data: customers = [], 
    isLoading: isCustomersLoading,
    isFetching: isCustomersFetching
  } = useCustomers(currentPage, rowsPerPage);
  const { addMutation } = useCustomerMutations();

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

  // Handle customer submit
  const handleCustomerSubmit = useCallback(async (form: Customer, mode: "add" | "edit") => {
    try {
      const mutation = addMutation; // Only add for now
      const res = await mutation.mutateAsync(form);
      toast.success(res.message || (mode === "add" ? "Customer added!" : "Customer updated!"), { duration: 3000 });
      setIsDialogOpen(false);
      setSelectedCustomer(null);
    } catch (err) {
      toast.error("Error saving customer", { duration: 3000 });
    }
  }, [addMutation]);

  const handleOpenAddDialog = useCallback(() => {
    setDialogMode('add');
    setSelectedCustomer(null);
    setIsDialogOpen(true);
  }, []);

  const handleOpenEditDialog = useCallback((customer: Customer) => {
    setDialogMode('edit');
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedCustomer(null);
  }, []);

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-32">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Loading customers...</span>
    </div>
  );

  // Memoized table props
  const tableProps = useMemo(() => ({
    data: customers,
    columns,
    isLoading: isCustomersLoading || isCustomersFetching,
    addLabel: "Add Customer",
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
    searchColumn: "customerName",
    searchPlaceholder: "Search by customer name..."
  }), [
    customers,
    columns,
    isCustomersLoading,
    isCustomersFetching,
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
          <h1 className="text-3xl font-bold tracking-tight">Customer Inventory</h1>
          <p className="text-muted-foreground">
            Total Customers: {totalItems}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              addMutation.reset();
            }}
            disabled={isCustomersFetching}
          >
            {isCustomersFetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              "Refresh"
            )}
          </Button>
          <Button onClick={handleOpenAddDialog}>Add Customer</Button>
        </div>
      </div>

      <AddCustomerDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        onSubmit={handleCustomerSubmit}
        initialData={selectedCustomer || undefined}
        mode={dialogMode}
      />

      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>
            {isCustomersLoading || isCustomersFetching ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading customers...
              </div>
            ) : customers.length === 0 ? (
              <div className="text-muted-foreground">
                {isCountLoading 
                  ? "Loading initial data..."
                  : `No customers found ${currentPage > 1 ? `on page ${currentPage}` : ''}`}
              </div>
            ) : (
              `Showing ${customers.length} customers on page ${currentPage} of ${totalPages}`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCustomersLoading || isCustomersFetching ? (
            <LoadingSpinner />
          ) : customers.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                {currentPage > 1 
                  ? "No customers found on this page. Try going back to the first page."
                  : "No customers found. Add a new customer to get started."}
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