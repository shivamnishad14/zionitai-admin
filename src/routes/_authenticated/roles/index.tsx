import { createFileRoute } from '@tanstack/react-router'
// import { MainInventory } from '@/components/parts/PartInventoryPage'
import MainInventory from '@/components/roles/mainInventory'

export const Route = createFileRoute('/_authenticated/roles/')({
  component: MainInventory,
})


