import { LegalPage, LegalSection } from "@/components/LegalPage";

const CookiePolicy = () => (
  <LegalPage
    title="Cookie Policy | Joseph Maina"
    description="How josephmaina.co.ke uses cookies and analytics to improve your browsing experience."
    canonical="https://www.josephmaina.co.ke/cookie-policy"
    heading="Cookie Policy"
    lastUpdated="June 2026"
  >
    <p>This site uses cookies to:</p>
    <ul className="list-disc pl-6 space-y-1">
      <li>Analyze site traffic (Google Analytics)</li>
      <li>Remember your preferences</li>
      <li>Improve site performance</li>
    </ul>

    <LegalSection title="Types of Cookies We Use">
      <p>
        <strong className="text-foreground">Analytics Cookies:</strong> Google Analytics
        (G-XCTEXX3DG9) tracks page views and user behavior anonymously.
      </p>
      <p>
        <strong className="text-foreground">Functional Cookies:</strong> Remember your dark / light
        mode preference.
      </p>
    </LegalSection>

    <LegalSection title="How To Control Cookies">
      <p>
        You can disable cookies in your browser settings. Note that disabling cookies may affect
        site functionality.
      </p>
    </LegalSection>

    <LegalSection title="Contact">
      <p>
        For questions contact{" "}
        <a href="mailto:joemaish084@gmail.com" className="text-primary hover:underline">
          joemaish084@gmail.com
        </a>
        .
      </p>
    </LegalSection>
  </LegalPage>
);

export default CookiePolicy;
