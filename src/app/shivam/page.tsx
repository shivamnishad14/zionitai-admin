"use client"

import { AddMachineDialog } from "@/components/ui/add-machine-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function MachineInventoryPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold">Machine Inventory</h1>
        <div className="flex items-center">
          <AddMachineDialog />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Machine List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* TODO: Add machine list table here */}
          <p className="text-muted-foreground">No machines added yet.</p>
        </CardContent>
      </Card>
    </div>
  )
} 