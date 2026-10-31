import { LegalPage, LegalSection } from "@/components/LegalPage";
import { STATIC_HEADS } from "@/seo/heads";

const ChangeCookieChoice = () => (
  <button
    type="button"
    className="text-primary hover:underline"
    onClick={() => {
      try {
        localStorage.removeItem("cookie-consent-v1");
      } catch {
        // ignore
      }
      window.location.reload();
    }}
  >
    Change your cookie choice
  </button>
);

const CookiePolicy = () => (
  <LegalPage
    head={STATIC_HEADS.cookies}
    heading="Cookie Policy"
    lastUpdated="October 2026"
  >
    <p>This site uses cookies to:</p>
    <ul className="list-disc pl-6 space-y-1">
      <li>Analyze site traffic (Google Analytics)</li>
      <li>Measure our Facebook and Instagram ads (Meta Pixel)</li>
      <li>Remember your preferences</li>
      <li>Improve site performance</li>
    </ul>

    <LegalSection title="Types of Cookies We Use">
      <p>
        <strong className="text-foreground">Analytics Cookies:</strong> Google Analytics
        (G-X86CZEY9GV) tracks page views and user behavior anonymously.
      </p>
      <p>
        <strong className="text-foreground">Marketing Cookies:</strong> Meta Pixel measures visits and
        enquiries from our Facebook and Instagram ads. It only loads if you choose Accept All.
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
      <p>
        <ChangeCookieChoice /> at any time.
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
