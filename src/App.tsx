import { useEffect } from 'react';
import Lenis from 'lenis';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { OrderTracker } from './components/OrderTracker';
import { PersonaSection } from './components/PersonaSection';
import { GlobeStats } from './components/GlobeStats';
import { Security } from './components/Security';
import { Testimonials } from './components/Testimonials';
import { FAQ } from './components/FAQ';
import { CTASection } from './components/CTASection';
import { FooterTapedDesign } from './components/ui/footer-taped-design';
import { ClickEffect } from './components/ClickEffect';
import { BackToTop } from './components/BackToTop';

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-brand-black">
      <ClickEffect />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <OrderTracker />
        <PersonaSection />
        <GlobeStats />
        <Security />
        <Testimonials />
        <FAQ />
        <CTASection />
      </main>
      <FooterTapedDesign />
      <BackToTop />
    </div>
  );
}

export default App;
