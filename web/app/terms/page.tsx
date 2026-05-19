import Link from 'next/link'

export const metadata = { title: 'Terms of Service · e-Khadi' }

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F7F2E8]">
      {/* Back bar */}
      <div className="border-b border-[#C9BCA0] bg-[#EBE0C7]">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-[var(--mono)] text-[11px] tracking-widest uppercase text-[#6B6552] hover:text-[#E11D2A] transition-colors">
            <span>←</span>
            <span>Back to e-Khadi</span>
          </Link>
          <span className="font-[var(--serif)] italic text-sm text-[#14130E]">e-Khadi</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-10 space-y-10">

        {/* Title */}
        <div>
          <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552] mb-1">Legal · e-Khadi</p>
          <h1 className="font-[var(--serif)] italic text-4xl text-[#14130E]">Terms of Service</h1>
          <p className="font-[var(--mono)] text-[11px] text-[#A89971] mt-2">Last updated: May 2026 · Effective immediately</p>
        </div>

        <Section title="1. Acceptance of Terms">
          <p>By registering for or using e-Khadi, you agree to these Terms of Service. If you do not agree, do not use the service. These terms constitute a binding agreement between you and e-Khadi.</p>
        </Section>

        <Section title="2. Eligibility">
          <p>To use e-Khadi you must:</p>
          <ul className="mt-3">
            <li>Be a South African citizen or permanent resident aged 18 or older</li>
            <li>Hold a valid SASSA grant or be a registered spaza shop owner</li>
            <li>Provide accurate identity information including a valid South African ID number</li>
            <li>Be assigned to or approved by a registered stokvel group administrator</li>
          </ul>
        </Section>

        <Section title="3. The Credit Service">
          <ul>
            <li><strong>Credit limit:</strong> Maximum R1 000, subject to your credit health score. New members start at R50.</li>
            <li><strong>Approved uses:</strong> Credit may only be used for essential goods — food, electricity, medicine, toiletries, and baby products — at registered spaza shops.</li>
            <li><strong>Service fee:</strong> A flat 2% fee applies to each approved credit request. No hidden charges.</li>
            <li><strong>Repayment:</strong> The full credit amount plus service fee is automatically deducted from your next SASSA grant payment via your stokvel group administrator.</li>
            <li><strong>Grace period:</strong> Repayment is due within 5 days of grant day. Late repayment affects your credit health score.</li>
          </ul>
        </Section>

        <Section title="4. Your Responsibilities">
          <ul>
            <li>Keep your login credentials secure and do not share your account</li>
            <li>Ensure the personal and financial information you provide is accurate and up to date</li>
            <li>Use credit only for the approved essential goods categories</li>
            <li>Repay your credit balance promptly on grant day</li>
            <li>Report any unauthorised transactions immediately to support</li>
            <li>Not use the platform for any fraudulent, illegal, or deceptive purpose</li>
          </ul>
        </Section>

        <Section title="5. Stokvel Group Membership">
          <p>Access to credit is managed through stokvel groups. Your group administrator has the authority to:</p>
          <ul className="mt-3">
            <li>Approve or reject your group membership application</li>
            <li>Review and recommend approval of your credit requests</li>
            <li>Manage group savings and rotation schedules</li>
            <li>Report suspected misuse or fraud to e-Khadi administrators</li>
          </ul>
          <p className="mt-3">e-Khadi is not responsible for the internal governance of individual stokvel groups, but we do enforce platform-wide conduct standards.</p>
        </Section>

        <Section title="6. Registered Spaza Shops">
          <p>Shops registered on e-Khadi must:</p>
          <ul className="mt-3">
            <li>Hold a valid business licence to operate in South Africa</li>
            <li>Only accept e-Khadi credit for approved essential goods</li>
            <li>Not offer cash back or exchange credit for non-essential goods</li>
            <li>Reconcile transactions accurately and report discrepancies promptly</li>
          </ul>
          <p className="mt-3">e-Khadi reserves the right to suspend or remove shops that violate these terms.</p>
        </Section>

        <Section title="7. Suspension and Termination">
          <p>We may suspend or terminate your account if you:</p>
          <ul className="mt-3">
            <li>Provide false or fraudulent information</li>
            <li>Fail to repay credit for two or more consecutive grant cycles</li>
            <li>Attempt to use credit for non-essential or prohibited goods</li>
            <li>Engage in any behaviour that harms other members or the integrity of the platform</li>
          </ul>
          <p className="mt-3">You may close your account at any time, provided all outstanding balances are cleared first.</p>
        </Section>

        <Section title="8. Limitation of Liability">
          <p>e-Khadi provides the platform on an &ldquo;as-is&rdquo; basis. We are not liable for:</p>
          <ul className="mt-3">
            <li>Delays in SASSA grant payments that affect repayment schedules</li>
            <li>Actions or decisions made by stokvel group administrators</li>
            <li>Service interruptions due to factors outside our control (load shedding, network outages)</li>
            <li>Indirect or consequential losses arising from use of the platform</li>
          </ul>
          <p className="mt-3">Our total liability to you shall not exceed the value of credit you have outstanding at the time of any claim.</p>
        </Section>

        <Section title="9. Dispute Resolution">
          <p>If you have a dispute with e-Khadi:</p>
          <ul className="mt-3">
            <li>First contact support at <a href="mailto:hello@e-khadi.co.za" className="text-[#E11D2A] underline">hello@e-khadi.co.za</a> — we aim to resolve all disputes within 5 business days</li>
            <li>If unresolved, disputes may be referred to the National Consumer Commission of South Africa</li>
            <li>These terms are governed by the laws of the Republic of South Africa</li>
          </ul>
        </Section>

        <Section title="10. Changes to Terms">
          <p>We may update these terms from time to time. We will notify registered members via the app noticeboard at least 14 days before material changes take effect. Continued use of e-Khadi after changes take effect constitutes acceptance of the new terms.</p>
        </Section>

        {/* Bottom nav */}
        <div className="pt-6 border-t border-[#C9BCA0] flex items-center justify-between">
          <Link href="/" className="font-[var(--mono)] text-[11px] tracking-widest uppercase text-[#6B6552] hover:text-[#E11D2A] transition-colors flex items-center gap-2">
            <span>←</span> Back to e-Khadi
          </Link>
          <Link href="/privacy" className="font-[var(--mono)] text-[11px] tracking-widest uppercase text-[#6B6552] hover:text-[#E11D2A] transition-colors">
            Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl p-6 space-y-3">
      <h2 className="font-[var(--serif)] italic text-xl text-[#14130E]">{title}</h2>
      <div className="font-[var(--sans-dawn)] text-sm text-[#3D3928] leading-relaxed [&_ul]:space-y-2 [&_ul]:list-none [&_li]:flex [&_li]:gap-2 [&_li]:before:content-['·'] [&_li]:before:text-[#E11D2A] [&_li]:before:flex-shrink-0">
        {children}
      </div>
    </section>
  )
}
