import Link from 'next/link';

/**
 * Footer component with navigation links
 */
export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-secondary-900 text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Brand */}
                    <div>
                        <h3 className="text-2xl font-bold mb-2 text-gradient-light">
                            TaskMaster
                        </h3>
                        <p className="text-secondary-400">
                            Your simple and powerful task management solution
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/login"
                                    className="text-secondary-400 hover:text-white transition-colors"
                                >
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/register"
                                    className="text-secondary-400 hover:text-white transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/"
                                    className="text-secondary-400 hover:text-white transition-colors"
                                >
                                    Home
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* About */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">About</h4>
                        <p className="text-secondary-400 leading-relaxed">
                            Built with modern web technologies to provide you with the best task management experience.
                        </p>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-8 border-t border-secondary-800 text-center text-secondary-400">
                    <p>&copy; {currentYear} TaskMaster. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
