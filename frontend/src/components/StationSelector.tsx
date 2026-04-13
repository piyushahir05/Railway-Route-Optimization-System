import { useQuery } from '@tanstack/react-query';
import { getStations } from '../api/services';
import { Loader, AlertCircle } from 'lucide-react';

interface StationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
}

export default function StationSelector({
  value,
  onChange,
  label,
  placeholder = 'Select a station',
}: StationSelectorProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['stations'],
    queryFn: async () => {
      const response = await getStations();
      return response.data.stations;
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        {isLoading && (
          <div className="absolute right-3 top-2.5 flex items-center">
            <Loader size={20} className="text-blue-600 animate-spin" />
          </div>
        )}
        {isError && (
          <div className="absolute right-3 top-2.5 flex items-center">
            <AlertCircle size={20} className="text-red-500" />
          </div>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-10 cursor-pointer"
        >
          <option value="">{placeholder}</option>
          {data?.map((station) => (
            <option key={station} value={station}>
              {station}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
