import { LegalPage, LegalSection } from "@/components/LegalPage";

const Terms = () => (
  <LegalPage
    title="Terms of Service | Joseph Maina"
    description="Terms of Service for Joseph Maina Digital Marketing — payments, IP, cancellation and liability."
    canonical="https://www.josephmaina.co.ke/terms"
    heading="Terms of Service"
    lastUpdated="June 2026"
  >
    <p>By engaging Joseph Maina Digital Marketing services you agree to the following terms.</p>

    <LegalSection title="Services">
      <p>
        Services are delivered as outlined in the signed proposal. Scope changes require written
        agreement.
      </p>
    </LegalSection>

    <LegalSection title="Payment Terms">
      <ul className="list-disc pl-6 space-y-1">
        <li>50% deposit required before work begins</li>
        <li>Balance due 30 days after agreement</li>
        <li>Late payments subject to 5% monthly fee</li>
      </ul>
    </LegalSection>

    <LegalSection title="Intellectual Property">
      <p>
        All work created remains the property of Joseph Maina until full payment is received. Upon
        payment, all deliverables transfer to the client.
      </p>
    </LegalSection>

    <LegalSection title="Confidentiality">
      <p>
        Both parties agree to keep project details confidential unless written permission is given.
      </p>
    </LegalSection>

    <LegalSection title="Cancellation">
      <p>
        30 days written notice is required to end monthly retainer services. Deposits are
        non-refundable.
      </p>
    </LegalSection>

    <LegalSection title="Limitation of Liability">
      <p>
        Joseph Maina is not liable for indirect losses. Maximum liability is limited to fees paid
        in the last 30 days.
      </p>
    </LegalSection>

    <LegalSection title="Governing Law">
      <p>These terms are governed by the laws of Kenya.</p>
    </LegalSection>

    <LegalSection title="Contact">
      <p>
        <a href="mailto:joemaish084@gmail.com" className="text-primary hover:underline">
          joemaish084@gmail.com
        </a>
      </p>
    </LegalSection>
  </LegalPage>
);

export default Terms;
