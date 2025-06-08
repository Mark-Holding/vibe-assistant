import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { SearchPanelProps } from '../../types/code-analyzer';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const ITEMS_PER_PAGE = 50;

export const SearchPanel: React.FC<SearchPanelProps> = ({ 
  files, 
  onFileSelect, 
  searchTerm, 
  onSearchChange 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on new search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredFiles = useMemo(() => {
    if (!debouncedSearchTerm) return files;
    
    const term = debouncedSearchTerm.toLowerCase();
    return files.filter(file =>
      file.name.toLowerCase().includes(term) ||
      file.path.toLowerCase().includes(term)
    );
  }, [files, debouncedSearchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredFiles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedFiles = filteredFiles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  }, [onSearchChange]);

  const handleFileClick = useCallback((file: any) => {
    onFileSelect(file);
  }, [onFileSelect]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <Search size={20} className="mr-2 text-blue-600" />
          <CardTitle>Search Files</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            icon={Search}
            placeholder="Search files..."
            value={searchTerm}
            onChange={handleSearch}
          />
          
          <div className="overflow-y-auto max-h-[400px]">
            {filteredFiles.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No files found
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  {paginatedFiles.map(file => (
                    <div
                      key={file.path}
                      className="flex items-center py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => handleFileClick(file)}
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium">{file.name}</div>
                        <div className="text-xs text-gray-500">{file.path}</div>
                      </div>
                      <div className="text-xs text-gray-500">{file.type}</div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 px-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}

                {/* Results count */}
                <div className="text-sm text-gray-500 mt-2 px-2">
                  Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredFiles.length)} of {filteredFiles.length} results
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 