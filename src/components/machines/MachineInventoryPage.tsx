import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddMachineDialog } from '@/components/machines/add-machine-dialog'
import * as React from 'react'
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { apiFetch } from "@/api/client";
import { DataTable } from '../ui/DataTable'
// import  toast from "@/components/ui/sonner";
import { toast } from 'sonner'

// Define your Machine type if not already defined
type Machine = {
  machineId: number;
  machineName: string;
  capacity: string;
  configuration: string;
  machineColor: string;
  active: number;
  updDatetime: string;
};

const columns: ColumnDef<Machine>[] = [
  { accessorKey: "machineId", header: "ID" },
  { accessorKey: "machineName", header: "Name" },
  { accessorKey: "capacity", header: "Capacity" },
  { accessorKey: "configuration", header: "Configuration" },
  { accessorKey: "machineColor", header: "Color" },
  { accessorKey: "active", header: "Active" },
  { accessorKey: "updDatetime", header: "Updated At" },
];

export function MachineInventoryPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [data, setData] = useState<Machine[]>([]);

  // Fetch machines
  const fetchMachines = () => {
    apiFetch<Machine[]>("/machine/getAllMachines").then(setData);
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  // Handle add
  const handleAddMachine = async (form: any) => {
    try {
      const res = await apiFetch<{ code: number; message: string }>("/machine/addNewMachine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      toast.success(res.message || "Machine added!" , { duration: 3000 });
      setDialogOpen(false);
      console.log("success");
      
      fetchMachines(); // Refresh table
    } catch (err: any) {
      toast.error("Error adding machine");
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Machine Inventory</h1>
          <p className="text-muted-foreground">
            Manage and track your machine inventory
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>Add Machine</Button>
        <AddMachineDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleAddMachine} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Machines</CardTitle>
          <CardDescription>
            A list of all machines in your inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No machines found. Add your first machine to get started.
            </div>
          ) : (
            <DataTable
              data={data}
              columns={columns}
              isLoading={false}
              addLabel="Add Machine"
              onAddClick={() => setDialogOpen(true)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}