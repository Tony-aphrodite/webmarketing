"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/database";
import {
  LayoutDashboard,
  Building2,
  Heart,
  CreditCard,
  User,
  Users,
  FileText,
  Settings,
  ImageIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [
      "propietario",
      "propietario_preferido",
      "inversionista",
      "inquilino",
      "inquilino_premium",
      "pymes",
    ],
  },
  {
    label: "My Properties",
    href: "/dashboard/properties",
    icon: Building2,
    roles: ["propietario", "propietario_preferido", "inversionista"],
  },
  {
    label: "Image Gallery",
    href: "/dashboard/images",
    icon: ImageIcon,
    roles: ["propietario", "propietario_preferido", "inversionista"],
  },
  {
    label: "Recommended Services",
    href: "/dashboard/services",
    icon: Heart,
    roles: [
      "propietario",
      "propietario_preferido",
      "inversionista",
      "inquilino",
      "inquilino_premium",
      "pymes",
    ],
  },
  {
    label: "My Profile",
    href: "/dashboard/profile",
    icon: User,
    roles: [
      "propietario",
      "propietario_preferido",
      "inversionista",
      "inquilino",
      "inquilino_premium",
      "pymes",
    ],
  },
  // Admin routes
  {
    label: "Admin Panel",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ["admin"],
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    label: "Properties",
    href: "/admin/properties",
    icon: Building2,
    roles: ["admin"],
  },
  {
    label: "Leads",
    href: "/admin/leads",
    icon: FileText,
    roles: ["admin"],
  },
  {
    label: "Services",
    href: "/admin/services",
    icon: Settings,
    roles: ["admin"],
  },
  {
    label: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
    roles: ["admin"],
  },
];

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();

  const filteredItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 border-r bg-muted/30">
      <nav className="flex flex-col gap-1 p-4">
        {filteredItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "/admin" &&
              pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
