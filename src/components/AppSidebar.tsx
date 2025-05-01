import { Sidebar, SidebarContent, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { NavLink } from "react-router";
import {Combine, Images, FileStack, FileCog, Home} from "lucide-react";

const items = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Metadata edition",
      url: "metadata",
      icon: FileCog,
    },
    {
      title: "Merge PDFs",
      url: "merge",
      icon: Combine,
    },
    {
      title: "Image extraction",
      url: "extract-images",
      icon: Images,
    },
    {
      title: "Compose pages",
      url: "compose-pages",
      icon: FileStack,
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
                  <NavLink to={item.url}>
                    {() => (
                      <>
                        {item.icon && <item.icon />} {item.title}
                      </>
                    )}
                  </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
      </SidebarContent>
    </Sidebar>
  )
}
