import { Card } from '@/components/ui/Card';

/**
 * Features section showcasing app capabilities
 */
export function Features() {
    const features = [
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            ),
            title: 'Smart Task Management',
            description: 'Create, organize, and track your tasks with an intuitive interface. Mark tasks as complete and watch your productivity soar.',
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            title: 'Fast & Secure',
            description: 'Built with modern technology for blazing-fast performance. Your data is encrypted and secure with industry-standard authentication.',
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            title: 'Simple Dashboard',
            description: 'Clean, distraction-free interface that lets you focus on what matters. See your progress at a glance with visual statistics.',
        },
    ];

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-primary">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 px-4">
                    <h2 className="text-4xl sm:text-6xl font-bold text-secondary-900 dark:text-white mb-6">
                        Everything You Need to <span className="text-gradient">Stay Focused</span>
                    </h2>
                    <p className="text-xl text-secondary-600 dark:text-white/60 max-w-2xl mx-auto">
                        Powerful features designed to help you stay organized and achieve more with less effort.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            hover
                            className="p-8 animate-slide-up"
                            style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
                        >
                            <div className="text-primary-600 mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-secondary-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
