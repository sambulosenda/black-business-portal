import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 font-bold text-white">
                G
              </div>
              <span className="text-xl font-bold text-white">Glamfric</span>
            </div>
            <p className="mt-4 max-w-md text-gray-400">
              Connecting customers with talented Black beauty and wellness professionals. Support
              local businesses while looking and feeling your best.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-300 uppercase">
              For Customers
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/search" className="text-gray-400 transition-colors hover:text-white">
                  Find Services
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="text-gray-400 transition-colors hover:text-white">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link
                  href="/signup/customer"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-300 uppercase">
              For Businesses
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/signup/business"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  List Your Business
                </Link>
              </li>
              <li>
                <Link
                  href="/business/dashboard"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  Business Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/business/dashboard/analytics"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  Analytics
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8">
          <p className="text-center text-sm text-gray-400">
            © {currentYear} Glamfric. All rights reserved. Made with ❤️ for the Black community.
          </p>
        </div>
      </div>
    </footer>
  )
}
