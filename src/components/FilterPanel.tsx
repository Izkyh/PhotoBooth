import type { FilterType } from '../types';
import { Sparkles } from 'lucide-react';

interface FilterPanelProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filters: { value: FilterType; label: string }[] = [
  { value: 'none', label: 'Original' },
  { value: 'grayscale', label: 'B&W' },
  { value: 'sepia', label: 'Sepia' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'cool', label: 'Cool' },
  { value: 'warm', label: 'Warm' },
];

export const FilterPanel = ({ currentFilter, onFilterChange }: FilterPanelProps) => {
  return (
    <div>
      <div className="flex gap-2 flex-wrap">
        {filters.map(filter => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`px-5 py-3 rounded-lg font-semibold border-2 ${
              currentFilter === filter.value
                ? 'bg-black text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};