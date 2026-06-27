import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      
      tl.fromTo('.gsap-badge', 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1 }
      )
      .fromTo('.gsap-title', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1.2 },
        '-=0.7'
      )
      .fromTo('.gsap-desc', 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1 },
        '-=0.8'
      )
      .fromTo('.gsap-btn', 
        { y: 15, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8 },
        '-=0.6'
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={heroRef} 
      className="relative flex min-h-[75vh] items-center justify-center overflow-hidden bg-slate-950 pt-20 pb-24 md:min-h-[85vh] md:pt-32 md:pb-40"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80 mix-blend-luminosity"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1468495244123-6c6c332eeece?q=80&w=1600')" }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/10 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-violet-600/10 blur-[150px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <h1 className="gsap-title text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl font-display leading-[1.1]">
          Elevate your setup. <br />
          <span className="text-gradient">Premium tech boutique.</span>
        </h1>

        <p className="gsap-desc mx-auto mt-6 max-w-xl text-base sm:text-lg font-light text-slate-400 leading-relaxed">
          Discover a curated selection of lab-grade mechanical keyboards, high-fidelity audio hardware, smart wearables, and heavyweight minimalist apparel. Enjoy secure payments and fast worldwide shipping.
        </p>

        <div className="gsap-btn mt-10 flex justify-center">
          <a
            href="#catalog"
            className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-white px-8 py-3.5 text-sm font-medium text-black transition-all duration-300 hover:bg-slate-100 hover:shadow-[0_0_30px_5px_rgba(99,102,241,0.25)] hover:scale-[1.02]"
          >
            Explore Catalog 
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;