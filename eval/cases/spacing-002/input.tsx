// Hard spacing test - multiple violations

export function LandingPage() {
  return (
    <div>
      {/* Hero - same padding as everything else (should be MORE) */}
      <section className="py-16 px-6 bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-4xl font-bold text-center mb-4">
          Build Faster with AI
        </h1>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">
          The platform that helps you ship products 10x faster.
        </p>
        <div className="flex justify-center gap-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg">
            Get Started
          </button>
          <button className="px-6 py-3 border border-gray-300 rounded-lg">
            Learn More
          </button>
        </div>
      </section>

      {/* Stats - INVERTED: internal padding > gap (violation!) */}
      <section className="py-16 px-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-8 bg-gray-50 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-600">10x</div>
            <div className="text-gray-600">Faster Development</div>
          </div>
          <div className="p-8 bg-gray-50 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-600">500+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
          <div className="p-8 bg-gray-50 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-600">99.9%</div>
            <div className="text-gray-600">Uptime</div>
          </div>
        </div>
      </section>

      {/* Features - padding equals gap (same issue as test 001) */}
      <section className="py-16 px-6 bg-gray-50">
        <h2 className="text-2xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="w-10 h-10 bg-blue-100 rounded mb-4" />
            <h3 className="font-semibold mb-2">Fast</h3>
            <p className="text-sm text-gray-600">Lightning quick.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="w-10 h-10 bg-green-100 rounded mb-4" />
            <h3 className="font-semibold mb-2">Secure</h3>
            <p className="text-sm text-gray-600">Enterprise ready.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="w-10 h-10 bg-purple-100 rounded mb-4" />
            <h3 className="font-semibold mb-2">Simple</h3>
            <p className="text-sm text-gray-600">Easy to use.</p>
          </div>
        </div>
      </section>

      {/* Testimonial - sparse content with excessive padding */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center p-12 bg-gray-50 rounded-lg">
          <p className="text-xl italic text-gray-700 mb-4">
            "This changed everything."
          </p>
          <div className="text-gray-600">— Happy Customer</div>
        </div>
      </section>

      {/* CTA - same py-16 as everything (monotonous) */}
      <section className="py-16 px-6 bg-blue-600 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to start?</h2>
        <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold">
          Get Started Free
        </button>
      </section>
    </div>
  )
}

// Issues:
// 1. Every section has py-16 - no rhythm variation
// 2. Stats: p-8 (32px) with gap-4 (16px) - padding > gap (INVERTED!)
// 3. Features: p-6 (24px) with gap-6 (24px) - padding = gap
// 4. Testimonial: p-12 (48px) on sparse content - overwhelming
// 5. Hero should have MORE padding than other sections
