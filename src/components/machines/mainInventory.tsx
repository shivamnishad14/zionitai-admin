import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Main } from '@/components/layout/main'
import { MachineInventoryPage } from './MachineInventoryPage'
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
          <h1 className='text-2xl font-bold tracking-tight'>Machine Inventory</h1>
        </div>
        <Tabs
          orientation='vertical'
          defaultValue='overview'
          className='space-y-4'
        >
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='analytics'>Inward</TabsTrigger>
              <TabsTrigger value='reports'>Outward</TabsTrigger>
              <TabsTrigger value='notifications'>Sales invoice</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value='overview' className='space-y-4'>
            <MachineInventoryPage />
          </TabsContent>
          <TabsContent value='analytics' className='space-y-4'>
            <h1>This is Analytics</h1>
          </TabsContent>
          <TabsContent value='reports' className='space-y-4'>
            <h1>This is Report</h1>
          </TabsContent>
        </Tabs>
      </Main>
      </UsersProvider>
    </>
  )
}
