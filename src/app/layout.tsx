import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Outlet } from "react-router";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-screen h-screen flex flex-col p-4">
        <SidebarTrigger/>
        <div className="absolute top-0 right-0 m-4">
        <ThemeToggle />
        </div>
        <Outlet/>
      </main>
    </SidebarProvider>
  )
}
