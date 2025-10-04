import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-neutral-700" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="hidden sm:block text-xl font-bold text-neutral-900">Civix</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5 text-neutral-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-neutral-200">
            <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-sky-600" />
            </div>
            <span className="text-sm font-medium text-neutral-700">{user?.email?.split('@')[0]}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="ml-2"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
