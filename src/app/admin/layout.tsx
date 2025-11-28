export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authentication is handled at page level via API calls
  // This layout provides the common wrapper for admin pages

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
