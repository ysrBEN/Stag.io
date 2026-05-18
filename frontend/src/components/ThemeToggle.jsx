import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
            className="p-2 rounded-full transition-all duration-300
        bg-white/10 hover:bg-white/20 dark:bg-white/10 dark:hover:bg-white/20
        text-gray-700 dark:text-white"
        >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}
