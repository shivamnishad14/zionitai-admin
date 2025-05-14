"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { AddPartDialog } from "@/components/ui/add-part-dialog" // Uncomment when dialog is ready

export default function PartInventoryPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Part Inventory</h1>
        {/* <AddPartDialog /> */}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Part List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* TODO: Add part list table here */}
          <p className="text-muted-foreground">No parts added yet.</p>
        </CardContent>
      </Card>
    </div>
  )
} 