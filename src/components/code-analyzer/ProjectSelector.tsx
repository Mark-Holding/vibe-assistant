"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { projectService, Project } from '../../lib/database/projects';

interface ProjectSelectorProps {
  currentProjectId?: string;
  currentProjectName?: string;
  onProjectChange: (projectId: string) => void;
  onProjectDelete: (projectId: string) => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  currentProjectId,
  currentProjectName,
  onProjectChange,
  onProjectDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Refresh projects when currentProjectId changes (new project created)
  useEffect(() => {
    if (currentProjectId) {
      loadProjects();
    }
  }, [currentProjectId]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Loading projects from database...');
      const projectList = await projectService.getProjects();
      console.log('📋 Projects loaded:', projectList);
      setProjects(projectList);
    } catch (error) {
      console.error('❌ Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    onProjectChange(project.id);
    setIsOpen(false);
  };

  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await onProjectDelete(projectId);
        await loadProjects(); // Refresh the list
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const displayName = currentProjectName || 'Select Project';

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 min-w-[200px] justify-between"
        disabled={isLoading}
      >
        <span className="truncate">
          {isLoading ? 'Loading...' : displayName}
        </span>
        <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 z-50 min-w-[300px]">
          <div className="py-1">
            {projects.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">
                No projects found
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className={`flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer ${
                    project.id === currentProjectId ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                  onClick={() => handleProjectSelect(project)}
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium">{project.name}</div>
                    <div className="text-xs text-gray-500">
                      {project.total_files} files • {new Date(project.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, project.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete project"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 