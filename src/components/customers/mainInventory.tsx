import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Main } from '@/components/layout/main'
import { CustomerInventoryPage } from './CustomerInventoryPage'
import { Header } from '../layout/header'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import UsersProvider from '@/features/users/context/users-context'

export default function MainInventory() {
  return (
    <>
    <UsersProvider>
    <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
   
      <Main> 
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Customer Inventory</h1>
        </div>    
        
         
            <CustomerInventoryPage />
         
      </Main> 
      </UsersProvider>
    </>
  )
}
