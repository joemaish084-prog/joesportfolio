export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} Joseph Isaac Maina. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with passion in <span className="text-primary">Nairobi, Kenya</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
