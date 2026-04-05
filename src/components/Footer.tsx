export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <p className="text-sm font-medium text-foreground">
              Joseph Maina · Digital Marketing Specialist · SEO Expert Nairobi
            </p>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Joseph Isaac Maina. All rights reserved.
            </p>
          </div>
          <div className="text-center sm:text-right space-y-1">
            <p className="text-sm text-muted-foreground">
              <span className="text-primary">Digital Marketer for Hire · Nairobi, Kenya</span>
            </p>
            <p className="text-xs text-muted-foreground flex flex-wrap items-center justify-center sm:justify-end gap-2">
              <a href="mailto:joemaish084@gmail.com" className="hover:text-primary transition-colors">
                joemaish084@gmail.com
              </a>
              <span>·</span>
              <a href="tel:+254704700160" className="hover:text-primary transition-colors">
                +254 704 700 160
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
