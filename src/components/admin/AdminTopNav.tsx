import { NavLink } from "@/components/NavLink";
import { ReactNode } from "react";

interface AdminTopNavProps {
  rightSlot?: ReactNode;
}

const navItems = [
  { label: "Panel", to: "/panel" },
  { label: "Klienci", to: "/panel/klienci" },
  { label: "Raporty", to: "/panel/raporty" },
];

const AdminTopNav = ({ rightSlot }: AdminTopNavProps) => {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex flex-wrap items-center gap-6 px-4 py-4">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold mr-4">Panel Administracyjny</h1>
          <nav className="flex items-center gap-6 text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="text-muted-foreground transition-colors hover:text-foreground"
                activeClassName="text-foreground"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        {rightSlot ? <div className="ml-auto flex items-center gap-4">{rightSlot}</div> : null}
      </div>
    </header>
  );
};

export default AdminTopNav;
