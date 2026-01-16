import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'POC Full-Stack App',
  description: 'A proof-of-concept full-stack application with Next.js, Express, and PostgreSQL',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <nav className="bg-primary-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">POC Full-Stack Application</h1>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-gray-800 text-white mt-12">
          <div className="container mx-auto px-4 py-6 text-center">
            <p>&copy; 2024 POC Full-Stack Application. Built with Next.js, Express, and PostgreSQL.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
