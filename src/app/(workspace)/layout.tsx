import { DesktopSidebar, MobileDock } from "../../components/layout/Navigation";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Renders only on desktop (768px+) */}
      <DesktopSidebar />

      {/* Main Content Area - padded left for desktop sidebar, padded bottom for mobile dock */}
      <div className="md:pl-20 lg:pl-64 pb-16 md:pb-0 min-h-screen">
        {children}
      </div>

      {/* Renders only on mobile (<768px) */}
      <MobileDock />
    </div>
  );
}