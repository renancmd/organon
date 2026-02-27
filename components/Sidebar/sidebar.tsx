import Link from "next/link";
import { 
  Hexagon, // Placeholder for your Logo
  Home, 
  FolderKanban, 
  CheckSquare, 
  Calendar, 
  Repeat, 
  BookOpen, 
  User 
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="fixed bottom-0 left-0 z-50 flex w-full flex-row items-center justify-between border-t border-gray-200 bg-background px-4 py-3 dark:border-gray-800 md:top-0 md:h-screen md:w-20 md:flex-col md:border-r md:border-t-0 md:px-0 md:py-6 transition-colors duration-300">
      
      {/* Top Section: Logo (Hidden on mobile to save space) */}
      <div className="hidden md:flex flex-col items-center">
        <Link href="/" className="text-brand p-2 mb-8">
          <Hexagon size={32} strokeWidth={2.5} />
        </Link>
      </div>

      {/* Middle Section: Main Navigation */}
      <nav className="flex w-full flex-row items-center justify-between md:w-auto md:flex-col md:gap-8">
        <NavItem href="/" icon={<Home size={24} />} label="Home" />
        <NavItem href="/projects" icon={<FolderKanban size={24} />} label="Projects" />
        <NavItem href="/to-do" icon={<CheckSquare size={24} />} label="To-Do" />
        <NavItem href="/calendar" icon={<Calendar size={24} />} label="Calendar" />
        <NavItem href="/habits" icon={<Repeat size={24} />} label="Habits" />
        <NavItem href="/journal" icon={<BookOpen size={24} />} label="Journal" />
        
        {/* User Icon on Mobile (Moves to bottom on desktop) */}
        <div className="md:hidden">
          <NavItem href="/profile" icon={<User size={24} />} label="Profile" />
        </div>
      </nav>

      {/* Bottom Section: User (Desktop Only) */}
      <div className="hidden md:flex flex-col items-center mt-auto">
        <NavItem href="/profile" icon={<User size={24} />} label="Profile" />
      </div>
      
    </aside>
  );
}

// Helper component to keep links clean and consistent
function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      title={label}
      className="text-text-primary hover:text-brand transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {icon}
    </Link>
  );
}
