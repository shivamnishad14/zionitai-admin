import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/api/client';

export type Customer = {
  customerId: number;
  customerName: string;
  address: string;
  pincode: string;
  ph_number: string;
  city: string;
  active: number;
  addDatetime: string;
};

export function useCustomers(page: number, perPage: number) {
  return useQuery({
    queryKey: ['customers', page, perPage],
    queryFn: () => apiFetch<Customer[]>(`/customer/getListCustomerByLimit?pageNo=${page}&perPage=${perPage}`),
  });
}

export function useCustomerCount() {
  return useQuery({
    queryKey: ['customerCount'],
    queryFn: () => apiFetch<number>('/customer/getCustomerCount'),
  });
}

export function useCustomerMutations() {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (customer: Customer) => apiFetch<any>('/customer/addNewcustomer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customerCount'] });
    },
  });

  // You can add update/delete mutations here 
  const updateMutation = useMutation({
    mutationFn: (customer: Customer) => apiFetch<any>('/customer/updateMachine', {
      method: 'POST', // or 'PUT' if your API expects it
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customerCount'] });
    },
  });

  return { addMutation, updateMutation };
} 

