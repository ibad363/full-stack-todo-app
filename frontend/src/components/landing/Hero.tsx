import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

/**
 * Hero section for AuraTask landing page
 */
export function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-mesh-gradient pt-20">
            {/* Animated accent glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-accent-500/20 rounded-full blur-[120px] animate-pulse-slow delay-700" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in border-primary-500/20">
                    <Sparkles className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-medium text-white/80">Introducing AuraTask 2.0</span>
                </div>

                <div className="animate-slide-up">
                    <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
                        Master Your Day with
                        <br />
                        <span className="text-gradient">AuraTask</span>
                    </h1>
                    <p className="text-xl sm:text-2xl text-white/60 mb-12 max-w-3xl mx-auto leading-relaxed">
                        The ultra-minimal, high-performance task manager designed for focused minds.
                        Experience productivity that feels like a breeze.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
                        <Link href="/register">
                            <Button
                                size="lg"
                                className="bg-primary-500 text-white hover:bg-primary-600 shadow-glow px-8 py-6 text-lg h-auto rounded-2xl group"
                            >
                                Start for Free
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button
                                size="lg"
                                variant="ghost"
                                className="text-white hover:bg-white/5 px-8 py-6 text-lg h-auto rounded-2xl border border-white/10"
                            >
                                View Demo
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Dashboard Preview / Mockup */}
                <div className="relative max-w-5xl mx-auto animate-slide-up delay-300">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-[2rem] blur opacity-20" />
                    <div className="relative glass-dark rounded-[2rem] p-4 sm:p-8 overflow-hidden">
                        <div className="flex items-center gap-2 mb-6 px-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                            <div className="w-3 h-3 rounded-full bg-green-500/50" />
                        </div>
                        <div className="space-y-4">
                            {[
                                { text: 'Complete landing page redesign', category: 'Project', done: true },
                                { text: 'Implement AuraTask 2.0 branding', category: 'Priority', done: true },
                                { text: 'Daily standup meeting at 10 AM', category: 'Work', done: false },
                                { text: 'Review performance metrics', category: 'Analytics', done: false },
                            ].map((todo, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-colors">
                                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${todo.done ? 'bg-primary-500 border-primary-500' : 'border-white/20'}`}>
                                        {todo.done && <CheckCircle2 className="w-4 h-4 text-white" />}
                                    </div>
                                    <span className={`text-lg ${todo.done ? 'text-white/40 line-through' : 'text-white/90'}`}>{todo.text}</span>
                                    <span className="ml-auto px-3 py-1 rounded-full bg-white/5 text-xs text-white/50 border border-white/5">{todo.category}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
