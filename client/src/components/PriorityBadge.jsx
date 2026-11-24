import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

const priorityConfig = {
  'High': {
    bg: 'bg-red-50 text-red-700 border-red-300',
    icon: AlertTriangle,
    dot: 'bg-red-500'
  },
  'Medium': {
    bg: 'bg-amber-50 text-amber-700 border-amber-300',
    icon: AlertCircle,
    dot: 'bg-amber-500'
  },
  'Low': {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    icon: Info,
    dot: 'bg-emerald-500'
  }
};

const PriorityBadge = ({ priority, size = 'sm' }) => {
  const config = priorityConfig[priority] || priorityConfig['Medium'];
  const Icon = config.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold border rounded-md ${config.bg} ${
        isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      <span>{priority} Priority</span>
    </span>
  );
};

export default PriorityBadge;
