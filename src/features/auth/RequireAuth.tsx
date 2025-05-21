import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      navigate({ to: '/sign-in-2' })
    }
  }, [navigate])
  return <>{children}</>
}