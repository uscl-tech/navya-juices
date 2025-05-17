import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
          <div className="px-5 py-2">
            <Link href="/products" className="text-base text-gray-500 hover:text-gray-900">
              Products
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link href="/challenges" className="text-base text-gray-500 hover:text-gray-900">
              Challenges
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link href="/benefits" className="text-base text-gray-500 hover:text-gray-900">
              Benefits
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link href="/about" className="text-base text-gray-500 hover:text-gray-900">
              About
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link href="/contact" className="text-base text-gray-500 hover:text-gray-900">
              Contact
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link href="/admin-direct" className="text-base text-red-500 hover:text-red-900">
              Admin Access
            </Link>
          </div>
        </nav>
        <p className="mt-8 text-center text-base text-gray-400">
          &copy; {currentYear} Navya's Fresh Juices. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
