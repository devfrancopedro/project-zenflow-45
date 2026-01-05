import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-card px-4 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <span className="text-lg font-bold text-primary">GestPro</span>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 transform bg-sidebar transition-transform duration-300 lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="space-y-1 px-3 py-4">
          <MobileNavItems onClose={() => setMobileMenuOpen(false)} />
        </nav>
      </div>

      {/* Main Content */}
      <main className="lg:pl-64 min-h-screen">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FolderKanban, UserCog } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clientes' },
  { to: '/projects', icon: FolderKanban, label: 'Projetos' },
  { to: '/sellers', icon: UserCog, label: 'Vendedores' },
];

function MobileNavItems({ onClose }: { onClose: () => void }) {
  const location = useLocation();

  return (
    <>
      {navItems.map((item) => {
        const isActive = location.pathname === item.to || 
          (item.to !== '/' && location.pathname.startsWith(item.to));
        
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </>
  );
}
