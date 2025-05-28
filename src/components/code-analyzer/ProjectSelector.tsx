"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface Project {
  id: string;
  name: string;
}

interface ProjectSelectorProps {
  onProjectChange: (projectId: string) => void;
  onProjectDelete: (projectId: string) => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  onProjectChange,
  onProjectDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Temporary mock data - will be replaced with actual data from the database
  const projects: Project[] = [
    { id: '1', name: 'My React App' },
    { id: '2', name: 'E-commerce Frontend' },
    { id: '3', name: 'Portfolio Website' },
  ];

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    onProjectChange(project.id);
    setIsOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      onProjectDelete(projectId);
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 min-w-[200px] justify-between"
      >
        <span className="truncate">
          {selectedProject ? selectedProject.name : 'Select Project'}
        </span>
        <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleProjectSelect(project)}
              >
                <span className="truncate">{project.name}</span>
                <button
                  onClick={(e) => handleDelete(e, project.id)}
                  className="p-1 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 