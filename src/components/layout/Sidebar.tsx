import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  UserCog,
  ChevronLeft,
  ChevronRight,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clientes' },
  { to: '/projects', icon: FolderKanban, label: 'Projetos' },
  { to: '/sellers', icon: UserCog, label: 'Vendedores' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center w-full")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
            <Building2 className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-sidebar-foreground">
              GestPro
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || 
            (item.to !== '/' && location.pathname.startsWith(item.to));
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            collapsed && "px-2"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-2">Recolher</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
