   import { createFileRoute } from '@tanstack/react-router'
import MachineInventoryPage from '@/components/machines/mainInventory'

export const Route = createFileRoute('/_authenticated/machines/page')({
  component: MachineInventoryPage,
}) 