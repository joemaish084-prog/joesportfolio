import { LegalPage, LegalSection } from "@/components/LegalPage";
import { STATIC_HEADS } from "@/seo/heads";

const PrivacyPolicy = () => (
  <LegalPage
    head={STATIC_HEADS.privacy}
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
        <li>Meta Pixel data about ad visits and enquiries, if you accept cookies</li>
        <li>The page and campaign that brought you here, when you send an enquiry</li>
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
        If you accept cookies, we use Google Analytics to understand how visitors use our site and
        Meta Pixel to measure our ads. You can change your choice on our cookie policy page.
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
