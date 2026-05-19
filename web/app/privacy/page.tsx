import Link from 'next/link'

export const metadata = { title: 'Privacy Policy · e-Khadi' }

export default function PrivacyPage() {
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
          <h1 className="font-[var(--serif)] italic text-4xl text-[#14130E]">Privacy Policy</h1>
          <p className="font-[var(--mono)] text-[11px] text-[#A89971] mt-2">Last updated: May 2026 · Effective immediately</p>
        </div>

        <Section title="1. Who We Are">
          <p>e-Khadi is a community credit platform operated in South Africa, providing micro-credit services to SASSA grant recipients through registered stokvel groups and spaza shop networks. Our registered business address is in Johannesburg, South Africa.</p>
          <p className="mt-3">For privacy enquiries, contact us at <a href="mailto:hello@e-khadi.co.za" className="text-[#E11D2A] underline">hello@e-khadi.co.za</a>.</p>
        </Section>

        <Section title="2. Information We Collect">
          <ul>
            <li><strong>Identity information:</strong> Full name, South African ID number, phone number, and address — collected at registration to verify eligibility.</li>
            <li><strong>Financial information:</strong> SASSA grant status, credit request amounts, repayment history, and wallet balance.</li>
            <li><strong>Transaction data:</strong> Purchases made at registered spaza shops using e-Khadi credit, including amounts and timestamps.</li>
            <li><strong>Device &amp; usage data:</strong> IP address, browser type, and pages visited — used to improve the service and detect fraud.</li>
            <li><strong>Communications:</strong> Messages sent to support, WhatsApp interactions, and noticeboard posts within your stokvel group.</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul>
            <li>To assess creditworthiness and determine your credit limit</li>
            <li>To process and track credit requests, approvals, and repayments</li>
            <li>To calculate your credit health score and provide personalised advice</li>
            <li>To verify your identity and prevent fraud</li>
            <li>To communicate important service updates and grant cycle reminders</li>
            <li>To comply with South African law, including POPIA and FICA requirements</li>
          </ul>
        </Section>

        <Section title="4. Who We Share Your Data With">
          <p>We do not sell your personal information. We may share data with:</p>
          <ul className="mt-3">
            <li><strong>Stokvel group administrators:</strong> Your name, credit balance, and repayment status within your group.</li>
            <li><strong>Registered spaza shops:</strong> Transaction amounts only — no personal identity information is shared at point of sale.</li>
            <li><strong>SASSA-aligned verification services:</strong> To confirm grant eligibility with your consent.</li>
            <li><strong>Service providers:</strong> Hosting (Huawei Cloud, South Africa region), database, and communication providers bound by data processing agreements.</li>
            <li><strong>Authorities:</strong> Where required by South African law or court order.</li>
          </ul>
        </Section>

        <Section title="5. Data Retention">
          <p>We retain your personal data for as long as your account is active, plus a minimum of 5 years as required by South African financial regulations. You may request deletion of non-essential data at any time by contacting us.</p>
        </Section>

        <Section title="6. Your Rights Under POPIA">
          <p>As a South African resident, you have the right to:</p>
          <ul className="mt-3">
            <li>Access the personal information we hold about you</li>
            <li>Correct inaccurate or outdated information</li>
            <li>Request deletion of your personal information (subject to legal retention requirements)</li>
            <li>Object to the processing of your personal information</li>
            <li>Lodge a complaint with the Information Regulator of South Africa</li>
          </ul>
          <p className="mt-3">To exercise any of these rights, email <a href="mailto:hello@e-khadi.co.za" className="text-[#E11D2A] underline">hello@e-khadi.co.za</a> with the subject line "POPIA Request".</p>
        </Section>

        <Section title="7. Data Security">
          <p>All data is stored on servers located in South Africa (Huawei Cloud af-south-1 region). We use industry-standard encryption (TLS 1.3) for data in transit and AES-256 for data at rest. Access to personal data is restricted to authorised personnel only.</p>
        </Section>

        {/* Cookies section with anchor */}
        <Section title="8. Cookie Policy" id="cookies">
          <p>e-Khadi uses the following types of cookies:</p>
          <ul className="mt-3">
            <li><strong>Essential cookies:</strong> Required for authentication and session management. Cannot be disabled.</li>
            <li><strong>Analytics cookies:</strong> Help us understand how members use the platform so we can improve it. You may opt out.</li>
            <li><strong>Preference cookies:</strong> Remember your settings such as language and notification preferences.</li>
          </ul>
          <p className="mt-3">You can manage cookie preferences through your browser settings. Disabling essential cookies will prevent you from logging in.</p>
        </Section>

        {/* POPIA section with anchor */}
        <Section title="9. POPIA Compliance" id="popia">
          <p>e-Khadi is committed to full compliance with the Protection of Personal Information Act (POPIA), Act 4 of 2013. Our compliance measures include:</p>
          <ul className="mt-3">
            <li>Appointed an Information Officer responsible for data protection</li>
            <li>Implemented a Privacy Impact Assessment (PIA) for all data processing activities</li>
            <li>Established data processing agreements with all third-party service providers</li>
            <li>Implemented data breach notification procedures (72-hour reporting requirement)</li>
            <li>Restricted cross-border data transfers to countries with adequate protection</li>
            <li>Conducted staff training on data protection obligations</li>
          </ul>
          <p className="mt-3">Our POPIA registration number is available on request. To contact the Information Regulator of South Africa: <a href="https://www.justice.gov.za/inforeg/" className="text-[#E11D2A] underline" target="_blank" rel="noopener noreferrer">www.justice.gov.za/inforeg</a>.</p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>We may update this policy from time to time. We will notify registered members of material changes via the app noticeboard and email at least 14 days before changes take effect.</p>
        </Section>

        {/* Back link at bottom */}
        <div className="pt-6 border-t border-[#C9BCA0] flex items-center justify-between">
          <Link href="/" className="font-[var(--mono)] text-[11px] tracking-widest uppercase text-[#6B6552] hover:text-[#E11D2A] transition-colors flex items-center gap-2">
            <span>←</span> Back to e-Khadi
          </Link>
          <Link href="/terms" className="font-[var(--mono)] text-[11px] tracking-widest uppercase text-[#6B6552] hover:text-[#E11D2A] transition-colors">
            Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  )
}

function Section({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl p-6 space-y-3 scroll-mt-20">
      <h2 className="font-[var(--serif)] italic text-xl text-[#14130E]">{title}</h2>
      <div className="font-[var(--sans-dawn)] text-sm text-[#3D3928] leading-relaxed [&_ul]:space-y-2 [&_ul]:list-none [&_li]:flex [&_li]:gap-2 [&_li]:before:content-['·'] [&_li]:before:text-[#E11D2A] [&_li]:before:flex-shrink-0">
        {children}
      </div>
    </section>
  )
}
