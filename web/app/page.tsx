import Link from 'next/link'
import { ArrowRight, Users, Shield, Store, CheckCircle2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">eK</span>
            </div>
            <span className="font-bold text-xl text-primary">e-Khadi</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary-dark to-blue-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Available in Gauteng, KwaZulu-Natal & Western Cape
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            Community Credit for<br />
            <span className="text-blue-200">SASSA Grant Recipients</span>
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            e-Khadi is a stokvel-powered credit platform that lets SASSA grant recipients access essential goods on credit at trusted spaza shops in their community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-blue-50 font-semibold w-full sm:w-auto"
              >
                Join as Member
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 w-full sm:w-auto"
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-blue-200 text-sm">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              <span>No compound interest</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              <span>2% flat service fee</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              <span>Essential goods only</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-text-primary mb-3">
            How e-Khadi Works
          </h2>
          <p className="text-text-secondary text-center mb-10 max-w-lg mx-auto">
            Built on the traditional stokvel model, powered by technology
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Join a Group',
                desc: 'Sign up as a SASSA recipient and join a community stokvel group in your area. Groups pool resources together.',
                color: 'bg-primary-light text-primary',
              },
              {
                step: '02',
                title: 'Access Credit',
                desc: 'Request credit (R50–R300) against your monthly SASSA grant. Use it at registered spaza shops for food, medicine, and essentials.',
                color: 'bg-green-50 text-success',
              },
              {
                step: '03',
                title: 'Repay at Payday',
                desc: 'Credit is automatically repaid from your grant on payment day. Only 2% flat fee — no compound interest, no hidden charges.',
                color: 'bg-yellow-50 text-yellow-700',
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl p-6 shadow-sm border border-border">
                <div className={`inline-flex w-10 h-10 rounded-xl items-center justify-center text-sm font-bold mb-4 ${item.color}`}>
                  {item.step}
                </div>
                <h3 className="font-semibold text-text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-text-primary mb-3">
            Everything You Need
          </h2>
          <p className="text-text-secondary text-center mb-10">
            A complete platform for community-powered credit
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">Stokvel Groups</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Community savings groups that rotate payouts monthly. Pool resources with your neighbors and build collective credit power.
              </p>
              <ul className="mt-4 space-y-1.5">
                {['Rotation payouts', 'Wallet per group', 'Bucket spending categories'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-text-secondary">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">Grant-backed Credit</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Credit secured against your monthly SASSA grant. R50–R300 per request with transparent 2% service fee.
              </p>
              <ul className="mt-4 space-y-1.5">
                {['No hidden fees', 'Auto-repayment', 'Credit score tracking'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-text-secondary">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mb-4">
                <Store className="h-6 w-6 text-warning" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">Spaza Shop Network</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Registered spaza shops in your area accept e-Khadi credit for food, medicine, toiletries, electricity and baby products.
              </p>
              <ul className="mt-4 space-y-1.5">
                {['Area-locked shops', 'Essential goods only', 'Instant verification'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-text-secondary">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Trusted by Thousands</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                name: 'Nomsa Dlamini',
                location: 'Soweto, Gauteng',
                quote: 'e-Khadi helped me buy food for my kids before payday. The 2% fee is fair and I paid it back easily.',
              },
              {
                name: 'Sipho Nkosi',
                location: 'Durban, KwaZulu-Natal',
                quote: 'My stokvel group on e-Khadi has been running for 8 months. We all look after each other in hard times.',
              },
              {
                name: 'Thandeka Mokoena',
                location: 'Cape Town, Western Cape',
                quote: 'As a shop owner, e-Khadi brings more customers and I know the credit is guaranteed. Very good system.',
              },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-xl p-5 shadow-sm border border-border">
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm text-text-secondary italic leading-relaxed mb-4">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                  <p className="text-xs text-text-secondary">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-blue-100 mb-8">
            Join over 10,000 SASSA grant recipients who use e-Khadi for community credit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-blue-50 font-semibold w-full sm:w-auto">
                Register as Member
              </Button>
            </Link>
            <Link href="/register?role=SHOP">
              <Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 w-full sm:w-auto">
                Register Your Shop
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">eK</span>
            </div>
            <span className="font-bold text-primary">e-Khadi</span>
          </div>
          <p className="text-sm text-text-secondary">
            © 2024 e-Khadi. Community credit for South Africa.
          </p>
          <div className="flex gap-4 text-sm text-text-secondary">
            <Link href="/login" className="hover:text-primary transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-primary transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
