import { createFileRoute } from '@tanstack/react-router'
import Users from '@/components/users/mainInventory'

export const Route = createFileRoute('/_authenticated/users/')({
  component: Users,
})
 