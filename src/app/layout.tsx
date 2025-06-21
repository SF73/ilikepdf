import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Outlet } from "react-router";

export function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-screen h-screen flex flex-col p-4">
        <SidebarTrigger/>
        <Outlet/>
      </main>
    </SidebarProvider>
  )
}
