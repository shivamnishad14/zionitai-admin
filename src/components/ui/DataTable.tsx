import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { IconEdit, IconTrash, IconFileExport, IconEye, IconPlus, IconDotsVertical, IconColumns } from "@tabler/icons-react";
import * as XLSX from "xlsx";

interface DataTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  onAddClick?: () => void;
  startIcon?: React.ReactNode;
  addLabel?: string;
  addComponent?: React.ReactNode;
  onEditClick?: (row: T) => void;
  onViewClick?: (row: T) => void;
  onDeleteClick?: (row: T) => void;
  actionComponents?: React.ComponentType<{ rowData: T }>[];
  showEdit?: boolean;
  showView?: boolean;
  showDelete?: boolean;
  showActions?: boolean;
  showCheckbox?: boolean;
  getDisabledKeys?: (row: T) => string[];
  page?: number;
  totalPages?: number;
  setPage?: (page: number) => void;
  rowsPerPage?: number;
  onRowsPerPageChange?: (size: number) => void;
  pagination?: boolean;
  showPagination?: boolean;
  showRowsPerPage?: boolean;
  showExportButton?: boolean;
  showHideColumns?: boolean;
  showFilter?: boolean;
  onFilterChange?: (filters: any) => void;
  onSelectionChanged?: (selectedRows: T[]) => void;
  allData?: () => Promise<T[]>;
  fileName?: string;
  initialHiddenColumns?: string[];
}

export function DataTable<T extends object>({
  data = [],
  columns = [],
  isLoading = false,
  onAddClick,
  startIcon = <IconPlus />,
  addLabel = "Add New",
  addComponent,
  onEditClick,
  onViewClick,
  onDeleteClick,
  actionComponents = [],
  showEdit = true,
  showView = false,
  showDelete = true,
  showActions = true,
  showCheckbox = false,
  getDisabledKeys = () => [],
  page = 1,
  totalPages = 1,
  setPage,
  rowsPerPage = 10,
  onRowsPerPageChange,
  pagination = false,
  showPagination = true,
  showRowsPerPage = true,
  showExportButton = true,
  showHideColumns = true,
  showFilter = true,
  onFilterChange,
  onSelectionChanged,
  allData,
  fileName,
  initialHiddenColumns = [],
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    Object.fromEntries(
      columns
        .map((col) => (col as any).accessorKey as string)
        .filter((key) => key && !initialHiddenColumns.includes(key))
        .map((key) => [key, true])
    )
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isFilterEnabled, setIsFilterEnabled] = useState(false);

  // Add action column if needed
  const tableColumns = useMemo(() => {
    const cols = [...columns];
    
    if (showActions) {
      cols.push({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const disabledKeys = getDisabledKeys(row.original);
          const actionComponentsList = Array.isArray(actionComponents) 
            ? actionComponents 
            : [];

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <IconDotsVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {showEdit && (
                  <DropdownMenuItem onClick={() => onEditClick?.(row.original)}>
                    <div className="flex items-center gap-2">
                      <IconEdit /> Edit
                    </div>
                  </DropdownMenuItem>
                )}
                {showDelete && (
                  <DropdownMenuItem
                    onClick={() => onDeleteClick?.(row.original)}
                  >
                    <div className="flex items-center gap-2">
                      <IconTrash /> Delete
                    </div>
                  </DropdownMenuItem>
                )}
                {showView && (
                  <DropdownMenuItem onClick={() => onViewClick?.(row.original)}>
                    <div className="flex items-center gap-2">
                      <IconEye /> View
                    </div>
                  </DropdownMenuItem>
                )}
                {actionComponentsList.map((Component, index) => (
                  <DropdownMenuItem key={`custom-action-${index}`}>
                    <Component rowData={row.original} />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      } as ColumnDef<T>);
    }

    return cols;
  }, [columns, showActions, actionComponents, showEdit, showDelete, showView, onEditClick, onDeleteClick, onViewClick, getDisabledKeys]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: showCheckbox,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleExport = async () => {
    const exportData = allData ? await allData() : data;
    const visibleColumns = table.getAllColumns()
      .filter(column => column.getIsVisible())
      .map(column => ({
        header: typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id,
        accessorKey: column.id,
      }));

    const exportRows = exportData.map((row) => {
      const rowData: Record<string, any> = {};
      visibleColumns.forEach(col => {
        if (col.accessorKey) {
          rowData[col.header] = (row as any)[col.accessorKey];
        }
      });
      return rowData;
    });

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Exported Data");
    XLSX.writeFile(wb, `${fileName || 'exported_data'}.xlsx`);
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Top Controls */}
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-2">
          {onAddClick && (
            <Button
              variant="outline"
              onClick={onAddClick}
            >
              {startIcon}
              {addLabel}
            </Button>
          )}
          {addComponent && <div>{addComponent}</div>}
        </div>
        <div className="flex items-center gap-2">
          {showFilter && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Switch
                    checked={isFilterEnabled}
                    onCheckedChange={setIsFilterEnabled}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {isFilterEnabled ? "Search Off" : "Search On"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {showRowsPerPage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {rowsPerPage} Rows
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onRowsPerPageChange?.(5)}>5 Rows</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRowsPerPageChange?.(10)}>10 Rows</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRowsPerPageChange?.(20)}>20 Rows</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRowsPerPageChange?.(50)}>50 Rows</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {showExportButton && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={handleExport}>
                    <IconFileExport />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {showHideColumns && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <IconColumns />
                  Hide columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {table.getAllColumns()
                  .filter(column => column.id !== 'actions')
                  .map(column => (
                    <DropdownMenuItem
                      key={column.id}
                      onClick={() => {
                        column.toggleVisibility();
                      }}
                    >
                      {typeof column.columnDef.header === 'string' 
                        ? column.columnDef.header 
                        : column.id}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-2 text-left"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage?.(page - 1)} />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={p === page}
                  onClick={() => setPage?.(p)}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext onClick={() => setPage?.(page + 1)} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}