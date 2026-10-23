import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function CinematicIntro({ onComplete }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const auraRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setTimeout(onComplete, 500);
        }
      });

      tl.set(".intro-text span", { opacity: 0, y: 20 })
        .set(".intro-aura", { scale: 0, opacity: 0 })
        .set(".intro-overlay", { opacity: 1 })
        .to(".intro-aura", {
          scale: 1,
          opacity: 0.6,
          duration: 2,
          ease: "expo.out"
        })
        .to(".intro-text span", {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 1,
          ease: "power4.out"
        }, "-=1")
        .to(".intro-overlay", {
          opacity: 0,
          duration: 1.5,
          ease: "power2.inOut",
          delay: 1
        })
        .to(".intro-container", {
          yPercent: -100,
          duration: 1.2,
          ease: "expo.inOut"
        });
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div ref={containerRef} className="intro-container" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100vh',
      zIndex: 1000,
      backgroundColor: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      <div className="intro-overlay" style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'var(--bg-primary)',
        zIndex: 10
      }} />

      <div className="intro-aura" style={{
        position: 'absolute',
        width: '60vh',
        height: '60vh',
        background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
        filter: 'blur(80px)',
        zIndex: 1
      }} />

      <div className="intro-text" ref={textRef} style={{
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        color: 'var(--moonlit-silver)',
        fontFamily: 'var(--font-mono)',
        fontSize: '1.2rem',
        letterSpacing: '0.3em',
        textTransform: 'uppercase'
      }}>
        {"TURNING NOISE INTO ORDER".split(" ").map((word, i) => (
          <span key={i} style={{ display: 'block', marginBottom: '0.5rem' }}>{word}</span>
        ))}
      </div>
    </div>
  );
}
