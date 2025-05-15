import { createFileRoute } from '@tanstack/react-router'
// import { MainInventory } from '@/components/parts/PartInventoryPage'
import MainInventory from '@/components/customers/mainInventory'

export const Route = createFileRoute('/_authenticated/customers/')({
  component: MainInventory,
})


