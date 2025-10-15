import { Home, Users, TruckIcon, Package } from "lucide-react";
import { NavLink } from "react-router-dom";

export function AdminMobileNav() {
  const navItems = [
    { title: "Home", url: "/admin", icon: Home },
    { title: "Customers", url: "/admin/customers", icon: Users },
    { title: "Riders", url: "/admin/riders", icon: TruckIcon },
    { title: "Orders", url: "/admin/orders", icon: Package },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/admin"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-3 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
