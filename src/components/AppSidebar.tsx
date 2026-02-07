import { Sidebar, SidebarContent, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { NavLink } from "react-router";
import { Combine, Images, FileStack, FileCog, Home, FileArchive, Save, Wand2, SearchCode} from "lucide-react";

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Save PDF with Options",
    url: "save-pdf",
    icon: Save,
  },
  {
    title: "Metadata edition",
    url: "metadata",
    icon: FileCog,
  },
  {
    title: "Inspect PDF objects",
    url: "inspect-objects",
    icon: SearchCode,
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
  {
    title: "Compress",
    url: "compress",
    icon: FileArchive,
  },
  {
    title: "Rewrite Images",
    url: "rewrite-images",
    icon: Wand2,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <div className="m-4">
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
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
