export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-1 flex-col bg-muted/40">
      <header className="border-b bg-background px-6 py-4">
        <span className="font-semibold">DevMentor Admin</span>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
