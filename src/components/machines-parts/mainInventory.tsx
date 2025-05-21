// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Main } from '@/components/layout/main'
import { MachineComponentInventoryPage } from '@/components/machines-parts/machine_componentInventoryPage'
import { Header } from '../layout/header'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
// import UsersProvider from '@/features/users/context/users-context'

export default function MainInventory() {
  return (
    <>

      {/* ===== Top Heading ===== */}
      <Header>
        {/* <TopNav links={topNav} /> */}
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Machine Component Inventory</h1>
        </div>


        <MachineComponentInventoryPage />

      </Main>
    </>
  )
}
