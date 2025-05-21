import { createFileRoute } from '@tanstack/react-router'
import MachineParts from '@/components/machines-parts/mainInventory'

export const Route = createFileRoute('/_authenticated/machine-parts/')({
  component: MachineParts,
})
 