import { Home, DollarSign, User } from "lucide-react";
import { NavLink } from "react-router-dom";

export function RiderMobileNav() {
  const navItems = [
    { title: "Deliveries", url: "/rider", icon: Home },
    { title: "Payments", url: "/rider/payments", icon: DollarSign },
    { title: "Profile", url: "/rider/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/rider"}
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
