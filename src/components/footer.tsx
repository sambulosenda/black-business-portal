import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                G
              </div>
              <span className="text-xl font-bold text-white">Glamfric</span>
            </div>
            <p className="mt-4 text-gray-400 max-w-md">
              Connecting customers with talented Black beauty and wellness professionals. 
              Support local businesses while looking and feeling your best.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
              For Customers
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/search" className="text-gray-400 hover:text-white transition-colors">
                  Find Services
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="text-gray-400 hover:text-white transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link href="/signup/customer" className="text-gray-400 hover:text-white transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
              For Businesses
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/signup/business" className="text-gray-400 hover:text-white transition-colors">
                  List Your Business
                </Link>
              </li>
              <li>
                <Link href="/business/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  Business Dashboard
                </Link>
              </li>
              <li>
                <Link href="/business/dashboard/analytics" className="text-gray-400 hover:text-white transition-colors">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-center text-gray-400 text-sm">
            © {currentYear} Glamfric. All rights reserved. Made with ❤️ for the Black community.
          </p>
        </div>
      </div>
    </footer>
  )
}