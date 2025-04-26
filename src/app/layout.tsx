import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Outlet } from "react-router";

export function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full h-full flex flex-col p-6">
        <SidebarTrigger />
        <Outlet/>
      </main>
    </SidebarProvider>
  )
}
