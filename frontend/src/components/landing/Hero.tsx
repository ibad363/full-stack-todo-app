import Link from 'next/link';
import { Button } from '@/components/ui/Button';

/**
 * Hero section for landing page
 */
export function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary-400/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <div className="animate-slide-up">
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                        Organize Your Life
                        <br />
                        <span className="text-primary-100">One Task at a Time</span>
                    </h1>
                    <p className="text-xl sm:text-2xl text-primary-50 mb-10 max-w-3xl mx-auto leading-relaxed">
                        A simple, fast, and secure task management app that helps you stay productive and focused on what matters most.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/register">
                            <Button
                                size="lg"
                                className="bg-white text-primary-600 hover:bg-primary-50 shadow-large min-w-[200px]"
                            >
                                Get Started Free
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button
                                size="lg"
                                variant="ghost"
                                className="text-white border-2 border-white hover:bg-white/10 min-w-[200px]"
                            >
                                Login
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Feature highlights */}
                <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    {[
                        { icon: '⚡', text: 'Lightning Fast' },
                        { icon: '🔒', text: 'Secure & Private' },
                        { icon: '📱', text: 'Fully Responsive' },
                    ].map((feature, index) => (
                        <div
                            key={index}
                            className="glass p-6 rounded-xl animate-slide-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="text-4xl mb-2">{feature.icon}</div>
                            <p className="text-white font-medium">{feature.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </section>
    );
}
