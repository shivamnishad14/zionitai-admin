import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/api/client"
import { Component } from "@/components/parts/add-component-dialog"

// Query keys
const COMPONENT_KEYS = {
  all: ['components'] as const,
  lists: () => [...COMPONENT_KEYS.all, 'list'] as const,
  list: (page: number, perPage: number) => [...COMPONENT_KEYS.lists(), { page, perPage }] as const,
  count: () => [...COMPONENT_KEYS.all, 'count'] as const,
}

// Fetch functions
const fetchComponentCount = async (): Promise<number> => {
  const count = await apiFetch<number>("/component/getComponentCount", {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  })
  return count
}

const fetchComponents = async ({ page, perPage }: { page: number; perPage: number }): Promise<Component[]> => {
  const apiPage = Math.max(1, page)
  const response = await apiFetch<Component[]>(
    `/component/getListComponentByLimit?pageNo=${apiPage}&perPage=${perPage}`,
    {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    }
  )
  return response
}

const addComponent = async (component: Component): Promise<{ code: number; message: string }> => {
  return apiFetch<{ code: number; message: string }>("/component/addNewComponent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(component),
  })
}

const updateComponent = async (component: Component): Promise<{ code: number; message: string }> => {
  return apiFetch<{ code: number; message: string }>("/component/updateComponent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(component),
  })
}

// Custom hooks
export function useComponentCount() {
  return useQuery({
    queryKey: COMPONENT_KEYS.count(),
    queryFn: fetchComponentCount,
  })
}

export function useComponents(page: number, perPage: number) {
  return useQuery({
    queryKey: COMPONENT_KEYS.list(page, perPage),
    queryFn: () => fetchComponents({ page, perPage }),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
  })
}

export function useComponentMutations() {
  const queryClient = useQueryClient()

  const addMutation = useMutation({
    mutationFn: addComponent,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: COMPONENT_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: COMPONENT_KEYS.count() })
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateComponent,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: COMPONENT_KEYS.lists() })
    },
  })

  return {
    addMutation,
    updateMutation,
  }
} 