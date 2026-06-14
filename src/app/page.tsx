export default function POSFlowApp() {
  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 flex justify-between items-center p-6 bg-white shadow-md backdrop-blur-md bg-opacity-90">
          <h1 className="text-2xl font-bold text-blue-600">POS Flow</h1>
          <div className="space-x-6">
            <a href="#features" className="text-gray-600 hover:text-blue-600">
              Features
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-blue-600">
              Pricing
            </a>
            <a href="#contact" className="text-gray-600 hover:text-blue-600">
              Contact
            </a>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              <a href="/login">Get Started</a>
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="flex flex-col items-center justify-center flex-1 text-center px-6 pt-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-gray-800">
            Simplify Your Sales with{' '}
            <span className="text-blue-600">POS Flow</span>
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl">
            Manage transactions, track inventory, and boost your business
            efficiency — all in one intuitive POS platform.
          </p>
          <div className="space-x-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
              Try Free Demo
            </button>
            <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-md hover:bg-blue-50">
              Learn More
            </button>
          </div>
        </header>

        {/* Features */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">
              Key Features
            </h3>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="bg-gray-50 p-8 rounded-lg shadow hover:shadow-lg">
                <h4 className="text-xl font-semibold mb-2 text-blue-600">
                  Fast Checkout
                </h4>
                <p className="text-gray-600">
                  Speed up transactions with a streamlined and intuitive sales
                  interface.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-lg shadow hover:shadow-lg">
                <h4 className="text-xl font-semibold mb-2 text-blue-600">
                  Inventory Management
                </h4>
                <p className="text-gray-600">
                  Keep track of stock in real-time and get alerts for low
                  inventory.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-lg shadow hover:shadow-lg">
                <h4 className="text-xl font-semibold mb-2 text-blue-600">
                  Analytics Dashboard
                </h4>
                <p className="text-gray-600">
                  Gain insights into your sales performance with powerful
                  analytics tools.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          id="contact"
          className="bg-blue-600 text-white py-20 text-center"
        >
          <h3 className="text-3xl font-bold mb-4">
            Ready to Streamline Your Sales?
          </h3>
          <p className="mb-8 text-lg">
            Join hundreds of businesses using POS Flow to simplify their point
            of sale operations.
          </p>
          <button className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-md hover:bg-gray-100">
            Get Started Now
          </button>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-6 text-center">
          <p>© {new Date().getFullYear()} POS Flow. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
