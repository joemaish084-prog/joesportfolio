import { LegalPage, LegalSection } from "@/components/LegalPage";

const PrivacyPolicy = () => (
  <LegalPage
    title="Privacy Policy | Joseph Maina"
    description="How Joseph Maina Digital Marketing collects, uses and protects your personal information."
    canonical="https://www.josephmaina.co.ke/privacy-policy"
    heading="Privacy Policy"
    lastUpdated="June 2026"
  >
    <p>
      Joseph Maina Digital Marketing ("we", "our", "us") operates{" "}
      <a href="https://www.josephmaina.co.ke" className="text-primary hover:underline">
        josephmaina.co.ke
      </a>
      .
    </p>

    <LegalSection title="Information We Collect">
      <ul className="list-disc pl-6 space-y-1">
        <li>Name and email when you contact us</li>
        <li>Phone / WhatsApp number when provided</li>
        <li>Google Analytics usage data (anonymized)</li>
        <li>Cookies for site functionality</li>
      </ul>
    </LegalSection>

    <LegalSection title="How We Use Your Information">
      <ul className="list-disc pl-6 space-y-1">
        <li>To respond to your inquiries</li>
        <li>To send project proposals</li>
        <li>To deliver marketing services</li>
        <li>To improve our website</li>
      </ul>
    </LegalSection>

    <LegalSection title="Data Storage">
      <p>Your data is stored securely and never sold to third parties.</p>
    </LegalSection>

    <LegalSection title="Cookies">
      <p>
        We use Google Analytics cookies to understand how visitors use our site. You can opt out via
        your browser settings.
      </p>
    </LegalSection>

    <LegalSection title="Your Rights">
      <p>
        You have the right to request deletion of your personal data at any time by emailing{" "}
        <a href="mailto:joemaish084@gmail.com" className="text-primary hover:underline">
          joemaish084@gmail.com
        </a>
        .
      </p>
    </LegalSection>

    <LegalSection title="Contact">
      <p>
        Joseph Isaac Maina
        <br />
        <a href="mailto:joemaish084@gmail.com" className="text-primary hover:underline">
          joemaish084@gmail.com
        </a>
        <br />
        <a href="tel:+254704700160" className="text-primary hover:underline">
          +254 704 700 160
        </a>
        <br />
        Nairobi, Kenya
      </p>
    </LegalSection>
  </LegalPage>
);

export default PrivacyPolicy;
