import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const quickPoints = [
  'Community-powered loans through stokvel trust networks',
  'R50-R300 credit with a clear flat 2% service fee',
  'Spend only on essentials at approved local spaza shops',
]

const steps = [
  {
    title: 'Join',
    text: 'Members join a local stokvel group.',
  },
  {
    title: 'Request',
    text: 'They request small essential-goods credit.',
  },
  {
    title: 'Repay',
    text: 'Repayment is deducted from the next grant cycle.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-border bg-white sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">eK</span>
            </div>
            <span className="font-bold text-lg text-primary">e-Khadi</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-primary via-primary-dark to-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <div className="max-w-3xl">
            <p className="text-blue-200 text-sm font-medium mb-3">Built for SASSA Communities</p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight">
              Decentralized Community Credit
            </h1>
            <p className="mt-4 text-blue-100 text-lg leading-relaxed">
              A non-conventional finance model that gives underserved households fair micro-loans without traditional bank collateral.
            </p>

            <ul className="mt-6 space-y-2">
              {quickPoints.map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-blue-100">
                  <CheckCircle2 className="h-4 w-4 text-blue-200 flex-shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link href="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-blue-50 font-semibold w-full sm:w-auto">
                  Register as Member
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/register?role=SHOP">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 w-full sm:w-auto"
                >
                  Register Your Shop
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-9">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-text-primary">How It Works</h2>
          <div className="mt-4 grid sm:grid-cols-3 gap-4 sm:auto-rows-fr">
            {steps.map((step, idx) => (
              <div key={step.title} className="bg-white rounded-xl p-5 border border-border h-full min-h-[140px] flex flex-col">
                <p className="text-xs font-semibold text-primary">STEP {idx + 1}</p>
                <p className="text-base font-bold text-text-primary mt-1">{step.title}</p>
                <p className="text-sm text-text-secondary mt-2 flex-1">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl bg-primary text-white px-6 py-7 sm:px-8 sm:py-8">
            <h3 className="text-2xl font-bold">Simple. Fair. Community-Led.</h3>
            <p className="text-blue-100 mt-2 max-w-2xl text-sm sm:text-base">
              e-Khadi delivers practical financial access when families need it most.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <Link href="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-blue-50 font-semibold w-full sm:w-auto">
                  Start Now
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
          </div>
        </div>
      </section>
    </div>
  )
}
