import { createFileRoute } from '@tanstack/react-router'
// import { PartInventoryPage } from '@/components/parts/PartInventoryPage'
import PartInventoryPage from '@/components/parts/PartInventoryPage'

export const Route = createFileRoute('/_authenticated/parts/')({
  component: PartInventoryPage,
})


