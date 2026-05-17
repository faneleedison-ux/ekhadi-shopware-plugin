import Link from 'next/link'

export default function DawnFoot() {
  return (
    <footer className="foot">
      <div className="colophon">
        <div>
          <div className="colo-mark">e-Khadi</div>
          <div className="colo-tag">
            Community-powered micro-credit for SASSA grant recipients across South Africa.
            Fair pricing. Local impact. Built on the spirit of Ubuntu.
          </div>
          <a className="colo-wa" href="https://wa.me/27800000000">
            <span>WhatsApp Support</span>
            <span>→</span>
          </a>
        </div>
        <div className="colo-col">
          <h5>App</h5>
          <ul>
            <li><Link href="/register">Register as Member</Link></li>
            <li><Link href="/register?role=SHOP">Register Your Shop</Link></li>
            <li><Link href="/login">Sign In</Link></li>
            <li><Link href="/register?demo=true">View Demo</Link></li>
          </ul>
        </div>
        <div className="colo-col">
          <h5>Legal</h5>
          <ul>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Service</Link></li>
            <li><Link href="/privacy#cookies">Cookie Policy</Link></li>
            <li><Link href="/privacy#popia">POPIA Compliance</Link></li>
          </ul>
        </div>
        <div className="colo-col">
          <h5>Contact</h5>
          <ul>
            <li><a href="mailto:hello@e-khadi.co.za">hello@e-khadi.co.za</a></li>
            <li><a href="tel:+27800000000">+27 800 KHADI</a></li>
            <li><a href="mailto:press@e-khadi.co.za">Press Inquiries</a></li>
            <li><a href="mailto:partners@e-khadi.co.za">Partnerships</a></li>
          </ul>
        </div>
      </div>
      <div className="colo-bot">
        <div className="copy">© 2026 e-Khadi · Community Credit for South Africa</div>
        <div className="colo-badges">
          <span className="colo-badge indigo">SASSA-aligned</span>
          <span className="colo-badge leaf">POPIA compliant</span>
          <span className="colo-badge dawn">2% flat fee</span>
        </div>
      </div>
    </footer>
  )
}