import Link from 'next/link'

export default function DawnFinal() {
  return (
    <section className="final" id="cta">
      <div className="dawn-container">
        <div className="sec-cap reveal" style={{ justifyContent: 'center' }}>
          <span className="cap-rule" />
          <span className="cap-tag">Closing Notice</span>
          <span className="cap-rule" />
        </div>
        <h2 className="reveal">
          Simple. Fair.<br /><span className="acc">Community-Led.</span>
        </h2>
        <p className="reveal">
          Financial access when your family needs it most —<br />
          delivered with dignity, repaid with ease.
        </p>
        <div className="final-ctas reveal">
          <Link href="/register">
            <button className="btn-dawn">
              <span>Start Now</span>
              <span className="arr" />
            </button>
          </Link>
          <Link href="/login">
            <button className="btn-outline-day">Sign In</button>
          </Link>
        </div>
      </div>
    </section>
  )
}