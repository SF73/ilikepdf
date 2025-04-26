import { Sidebar, SidebarContent, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { NavLink } from "react-router";

const items = [
    {
      title: "Home",
      url: "/",
    //   icon: Home,
    },
    {
      title: "Metadata edition",
      url: "metadata-worker",
    //   icon: Inbox,
    },
    {
      title: "Image extraction",
      url: "extract-images-worker",
    //   icon: Calendar,
    },
    {
      title: "Select pages",
      url: "select-pages-worker",
    //   icon: Search,
    },
  ]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
      <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                  <NavLink to={item.url}>{item.title}</NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
      </SidebarContent>
    </Sidebar>
  )
}
