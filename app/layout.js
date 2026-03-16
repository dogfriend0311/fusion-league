import './globals.css'
import Navbar from './components/Navbar'
import AnimatedBackground from './components/AnimatedBackground'

export const metadata = {
  title: 'Fusion League',
  description: 'Official Fusion League website',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AnimatedBackground />
        <Navbar />
        <div style={{ paddingTop: '64px' }}>
          {children}
        </div>
      </body>
    </html>
  )
}