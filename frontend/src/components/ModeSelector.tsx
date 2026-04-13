import { DollarSign, Zap, Gauge } from 'lucide-react';

type Mode = 'distance' | 'travel_time' | 'ticket_cost';

interface ModeSelectorProps {
  value: Mode;
  onChange: (mode: Mode) => void;
}

export default function ModeSelector({ value, onChange }: ModeSelectorProps) {
  const modes = [
    { id: 'distance' as Mode, label: 'Distance', icon: Gauge, color: 'blue' },
    { id: 'travel_time' as Mode, label: 'Travel Time', icon: Zap, color: 'green' },
    { id: 'ticket_cost' as Mode, label: 'Ticket Cost', icon: DollarSign, color: 'purple' },
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Optimization Mode
      </label>
      <div className="grid grid-cols-3 gap-3">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const colorClasses = {
            blue: 'bg-blue-50 border-blue-300 text-blue-700',
            green: 'bg-green-50 border-green-300 text-green-700',
            purple: 'bg-purple-50 border-purple-300 text-purple-700',
          };

          return (
            <button
              key={mode.id}
              onClick={() => onChange(mode.id)}
              className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 font-medium ${
                value === mode.id
                  ? colorClasses[mode.color as keyof typeof colorClasses] + ' border-current'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon size={20} />
              <span className="hidden sm:inline">{mode.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
