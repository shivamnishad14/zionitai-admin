import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/api/client"

// Type definitions
export interface ComponentType {
  componentId: number
  componentName: string
  configuration: string
  componentCode: string
}

export interface MachineType {
  machineId: number
  machineName: string
  capacity: string
  configuration: string
  machineColor: string
  active: number
  updDatetime: string
}

export interface MachineComponent {
  machineComponentId: number
  component: ComponentType
  machine: MachineType
}

// Query keys
const MACHINE_COMPONENT_KEYS = {
  all: ['machineComponents'] as const,
  lists: () => [...MACHINE_COMPONENT_KEYS.all, 'list'] as const,
  list: () => [...MACHINE_COMPONENT_KEYS.lists()] as const,
  count: () => [...MACHINE_COMPONENT_KEYS.all, 'count'] as const,
}

// Fetch functions
const fetchMachineComponentCount = async (): Promise<number> => {
  const count = await apiFetch<number>("/machine_component/getMachineComponentCount", {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  })
  return count
}

const fetchMachineComponents = async (): Promise<MachineComponent[]> => {
  const response = await apiFetch<MachineComponent[]>(
    `/machine_component/getAllMachineComponents`,
    {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    }
  )
  return response
}

const addMachineComponent = async (machineComponent: MachineComponent): Promise<{ code: number; message: string }> => {
  return apiFetch<{ code: number; message: string }>("/machine_component/addNewMachineComponent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(machineComponent),
  })
}

const updateMachineComponent = async (machineComponent: MachineComponent): Promise<{ code: number; message: string }> => {
  return apiFetch<{ code: number; message: string }>("/machine_component/updateMachineComponent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(machineComponent),
  })
}

// Custom hooks
export function useMachineComponentCount() {
  return useQuery({
    queryKey: MACHINE_COMPONENT_KEYS.count(),
    queryFn: fetchMachineComponentCount,
  })
}

export function useMachineComponents() {
  return useQuery({
    queryKey: MACHINE_COMPONENT_KEYS.list(),
    queryFn: fetchMachineComponents,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
  })
}

export function useMachineComponentMutations() {
  const queryClient = useQueryClient()

  const addMutation = useMutation({
    mutationFn: addMachineComponent,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: MACHINE_COMPONENT_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: MACHINE_COMPONENT_KEYS.count() })
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateMachineComponent,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: MACHINE_COMPONENT_KEYS.lists() })
    },
  })

  return {
    addMutation,
    updateMutation,
  }
} 