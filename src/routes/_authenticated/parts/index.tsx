import { createFileRoute } from '@tanstack/react-router'
// import { MainInventory } from '@/components/parts/PartInventoryPage'
import MainInventory from '@/components/parts/mainInventory'

export const Route = createFileRoute('/_authenticated/parts/')({
  component: MainInventory,
})


