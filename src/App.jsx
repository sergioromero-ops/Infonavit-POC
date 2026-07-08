import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import ProofStrip from './components/ProofStrip.jsx'
import ChatDemo from './components/ChatDemo.jsx'
import Ecosystem from './components/Ecosystem.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import FoundingMember from './components/FoundingMember.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ProofStrip />
        <ChatDemo />
        <Ecosystem />
        <HowItWorks />
        <FoundingMember />
      </main>
      <Footer />
    </>
  )
}
