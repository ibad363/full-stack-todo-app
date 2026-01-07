import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Footer } from '@/components/landing/Footer';

/**
 * Landing page - Main entry point for the application
 */
export default function Home() {
    return (
        <main className="min-h-screen">
            <Hero />
            <Features />
            <HowItWorks />
            <Footer />
        </main>
    );
}
