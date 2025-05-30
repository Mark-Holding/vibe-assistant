'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export const UserMenu: React.FC = () => {
  const { user, signOut, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <button
        onClick={() => router.push('/auth')}
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <User size={16} className="mr-2" />
        Sign In
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <div className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100">
          {user.avatar ? (
            <img
              className="h-8 w-8 rounded-full mr-3"
              src={user.avatar}
              alt={user.name}
            />
          ) : (
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-sm font-medium text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-gray-900 truncate max-w-32">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 truncate max-w-32">
              {user.email}
            </p>
          </div>
          <ChevronDown size={16} className="ml-2 text-gray-400" />
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            {/* User info header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
            
            {/* Menu items */}
            <div className="py-1">
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
              >
                <LogOut size={16} className="mr-3" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 