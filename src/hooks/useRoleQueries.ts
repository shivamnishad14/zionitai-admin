import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/api/client"

// Role type definition
export interface Role {
  roleId: number
  roleName: string
  active: number
}

// Query keys
const ROLE_KEYS = {
  all: ['roles'] as const,
  lists: () => [...ROLE_KEYS.all, 'list'] as const,
  list: (page: number, perPage: number) => [...ROLE_KEYS.lists(), { page, perPage }] as const,
  count: () => [...ROLE_KEYS.all, 'count'] as const,
}

// Fetch functions
const fetchRoleCount = async (): Promise<number> => {
  const count = await apiFetch<number>("/Role/getRoleCount", {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  })
  return count
}

const fetchRoles = async ({ page, perPage }: { page: number; perPage: number }): Promise<Role[]> => {
  const apiPage = Math.max(1, page)
  const response = await apiFetch<Role[]>(
    `/Role/getListRoleByLimit?pageNo=${apiPage}&perPage=${perPage}`,
    {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    }
  )
  return response
}

const addRole = async (role: Role): Promise<{ code: number; message: string }> => {
  return apiFetch<{ code: number; message: string }>("/Role/addNewRole", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(role),
  })
}

const updateRole = async (role: Role): Promise<{ code: number; message: string }> => {
  return apiFetch<{ code: number; message: string }>("/Role/updateRole", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(role),
  })
}

// Custom hooks
export function useRoleCount() {
  return useQuery({
    queryKey: ROLE_KEYS.count(),
    queryFn: fetchRoleCount,
  })
}

export function useRoles(page: number, perPage: number) {
  return useQuery({
    queryKey: ROLE_KEYS.list(page, perPage),
    queryFn: () => fetchRoles({ page, perPage }),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
  })
}

export function useRoleMutations() {
  const queryClient = useQueryClient()

  const addMutation = useMutation({
    mutationFn: addRole,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ROLE_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: ROLE_KEYS.count() })
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateRole,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ROLE_KEYS.lists() })
    },
  })

  return {
    addMutation,
    updateMutation,
  }
} 