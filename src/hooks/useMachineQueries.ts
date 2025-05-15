import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/api/client"
import { Machine } from "@/components/machines/add-machine-dialog"

// Query keys
const MACHINE_KEYS = {
  all: ['machines'] as const,
  lists: () => [...MACHINE_KEYS.all, 'list'] as const,
  list: (page: number, perPage: number) => [...MACHINE_KEYS.lists(), { page, perPage }] as const,
  count: () => [...MACHINE_KEYS.all, 'count'] as const,
}

// Fetch functions
const fetchMachineCount = async (): Promise<number> => {
  const count = await apiFetch<number>("/machine/getMachineCount", {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  })
  return count
}

const fetchMachines = async ({ page, perPage }: { page: number; perPage: number }): Promise<Machine[]> => {
  const apiPage = Math.max(1, page)
  const response = await apiFetch<Machine[]>(
    `/machine/getListMachineByLimit?pageNo=${apiPage}&perPage=${perPage}`,
    {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    }
  )
  return response
}

const addMachine = async (machine: Machine): Promise<{ code: number; message: string }> => {
  return apiFetch<{ code: number; message: string }>("/machine/addNewMachine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(machine),
  })
}

const updateMachine = async (machine: Machine): Promise<{ code: number; message: string }> => {
  return apiFetch<{ code: number; message: string }>("/machine/updateMachine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(machine),
  })
}

// Custom hooks
export function useMachineCount() {
  return useQuery({
    queryKey: MACHINE_KEYS.count(),
    queryFn: fetchMachineCount,
  })
}

export function useMachines(page: number, perPage: number) {
  return useQuery({
    queryKey: MACHINE_KEYS.list(page, perPage),
    queryFn: () => fetchMachines({ page, perPage }),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
  })
}

export function useMachineMutations() {
  const queryClient = useQueryClient()

  const addMutation = useMutation({
    mutationFn: addMachine,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: MACHINE_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: MACHINE_KEYS.count() })
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateMachine,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: MACHINE_KEYS.lists() })
    },
  })

  return {
    addMutation,
    updateMutation,
  }
} 