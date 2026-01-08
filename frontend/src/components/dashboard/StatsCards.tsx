import { Card } from '@/components/ui/Card';

interface StatsCardsProps {
    pendingCount: number;
    completedCount: number;
    totalCount: number;
}

/**
 * Statistics cards showing task counts
 */
export function StatsCards({ pendingCount, completedCount, totalCount }: StatsCardsProps) {
    const stats = [
        {
            label: 'Pending',
            value: pendingCount,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
        {
            label: 'Completed',
            value: completedCount,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'text-success-600',
            bgColor: 'bg-success-50',
        },
        {
            label: 'Total Tasks',
            value: totalCount,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
            color: 'text-primary-600',
            bgColor: 'bg-primary-50',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="glass p-8 animate-slide-up rounded-3xl group border-transparent hover:border-primary-500/20 transition-all duration-500 card-hover"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-secondary-500 dark:text-white/40 mb-2">{stat.label}</p>
                            <p className="text-4xl font-bold font-display text-secondary-900 dark:text-white group-hover:text-primary-500 transition-colors">{stat.value}</p>
                        </div>
                        <div className={`${stat.bgColor} dark:bg-white/5 ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                            {stat.icon}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
