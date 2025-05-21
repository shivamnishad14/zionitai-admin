import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/api/client"

// User type definition
export interface Role {
  roleId: number
  roleName: string
  active: number
}

export interface User {
  userId: number
  username: string
  password: string | null
  newPassword: string | null
  firstName: string
  emailId: string
  lastName: string
  active: number
  updDatetime: string
  role: Role
}

// Query keys
const USER_KEYS = {
  all: ['users'] as const,
  lists: () => [...USER_KEYS.all, 'list'] as const,
  list: (page: number, perPage: number) => [...USER_KEYS.lists(), { page, perPage }] as const,
  count: () => [...USER_KEYS.all, 'count'] as const,
}

// Fetch functions
const fetchUserCount = async (): Promise<number> => {
  // Assuming the endpoint is /user/getUserCount
  const count = await apiFetch<number>("/user/getUserCount", {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  })
  return count
}

const fetchUsers = async ({ page, perPage }: { page: number; perPage: number }): Promise<User[]> => {
  const apiPage = Math.max(1, page)
  const response = await apiFetch<User[]>(
    `/user/getListUserByLimit?pageNo=${apiPage}&perPage=${perPage}`,
    {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    }
  )
  return response
}

const addUser = async (user: User): Promise<{ code: number; message: string }> => {
  return apiFetch<{ code: number; message: string }>("/user/addNewUser", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  })
}

const updateUser = async (user: User): Promise<{ code: number; message: string }> => {
  return apiFetch<{ code: number; message: string }>("/user/updateUser", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  })
}

// Custom hooks
export function useUserCount() {
  return useQuery({
    queryKey: USER_KEYS.count(),
    queryFn: fetchUserCount,
  })
}

export function useUsers(page: number, perPage: number) {
  return useQuery({
    queryKey: USER_KEYS.list(page, perPage),
    queryFn: () => fetchUsers({ page, perPage }),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
  })
}

export function useUserMutations() {
  const queryClient = useQueryClient()

  const addMutation = useMutation({
    mutationFn: addUser,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: USER_KEYS.count() })
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() })
    },
  })

  return {
    addMutation,
    updateMutation,
  }
}

// Username check function
export async function checkUserName(userName: string): Promise<{ code: number; message: string }> {
  return apiFetch<{ code: number; message: string }>(`/user/checkUserName?userName=${encodeURIComponent(userName)}`)
} 