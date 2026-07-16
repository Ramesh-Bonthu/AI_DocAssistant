import React from 'react'
import { Grid, List, Plus, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SearchBar } from './SearchBar'

interface TemplateToolbarProps {
  searchQuery: string
  onSearchChange: (val: string) => void
  sortBy: string
  onSortChange: (val: string) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  onUploadClick: () => void
  showFilters: boolean
  onToggleFilters: () => void
}

export function TemplateToolbar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onUploadClick,
  showFilters,
  onToggleFilters
}: TemplateToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
      {/* Search and filter toggler */}
      <div className="flex items-center gap-2 flex-1">
        <SearchBar value={searchQuery} onChange={onSearchChange} />
        <Button
          variant="outline"
          onClick={onToggleFilters}
          className={`h-10 px-3.5 rounded-xl border-slate-200 text-slate-600 gap-1.5 text-xs font-semibold ${
            showFilters ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-50' : 'bg-white'
          }`}
        >
          <Filter size={14} /> Filters
        </Button>
      </div>

      {/* Sort, View Mode, and Upload Trigger */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[150px] bg-white border-slate-200 h-10 rounded-xl text-xs font-medium">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
            <SelectItem value="recently_updated">Recently Updated</SelectItem>
          </SelectContent>
        </Select>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 h-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className={`h-8 w-8 p-0 rounded-lg ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600 hover:bg-blue-50' : 'text-slate-500'}`}
          >
            <Grid size={15} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('list')}
            className={`h-8 w-8 p-0 rounded-lg ${viewMode === 'list' ? 'bg-blue-50 text-blue-600 hover:bg-blue-50' : 'text-slate-500'}`}
          >
            <List size={15} />
          </Button>
        </div>

        {/* Add/Upload Button */}
        <Button
          onClick={onUploadClick}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 text-xs font-semibold px-4 shadow-blue gap-1.5"
        >
          <Plus size={15} /> Upload Template
        </Button>
      </div>
    </div>
  )
}
