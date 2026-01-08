/**
 * How It Works section showing 3-step process
 */
export function HowItWorks() {
    const steps = [
        {
            number: '01',
            title: 'Create Your Account',
            description: 'Sign up in seconds with just your email and password. No credit card required.',
        },
        {
            number: '02',
            title: 'Add Your Tasks',
            description: 'Start adding tasks with titles and descriptions. Organize your work effortlessly.',
        },
        {
            number: '03',
            title: 'Stay Productive',
            description: 'Track your progress, complete tasks, and achieve your goals one step at a time.',
        },
    ];

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20 px-4">
                    <h2 className="text-4xl sm:text-6xl font-bold text-secondary-900 dark:text-white mb-6">
                        Getting Started is <span className="text-gradient-purple">Effortless</span>
                    </h2>
                    <p className="text-xl text-secondary-600 dark:text-white/60 max-w-2xl mx-auto">
                        Join thousands of productive minds master their day in three simple steps.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    {/* Connection lines for desktop */}
                    <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200" />

                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="relative text-center animate-slide-up"
                            style={{ animationDelay: `${index * 150}ms` } as React.CSSProperties}
                        >
                            {/* Step number circle */}
                            <div className="relative inline-flex items-center justify-center w-32 h-32 mb-6 mx-auto">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full opacity-10 animate-pulse" />
                                <div className="relative bg-white border-4 border-primary-500 rounded-full w-24 h-24 flex items-center justify-center shadow-medium">
                                    <span className="text-3xl font-bold text-gradient">
                                        {step.number}
                                    </span>
                                </div>
                            </div>

                            <h3 className="text-2xl font-semibold text-secondary-900 mb-3">
                                {step.title}
                            </h3>
                            <p className="text-secondary-600 leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
