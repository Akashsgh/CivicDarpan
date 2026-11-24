import React from 'react';
import { Clock, Eye, UserCheck, Wrench, CheckCircle2, XCircle } from 'lucide-react';

const statusConfig = {
  'Submitted': {
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: Clock,
    label: 'Submitted'
  },
  'Under Review': {
    bg: 'bg-amber-50 text-amber-700 border-amber-300',
    icon: Eye,
    label: 'Under Review'
  },
  'Assigned': {
    bg: 'bg-blue-50 text-blue-700 border-blue-300',
    icon: UserCheck,
    label: 'Assigned'
  },
  'In Progress': {
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-300',
    icon: Wrench,
    label: 'In Progress'
  },
  'Resolved': {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    icon: CheckCircle2,
    label: 'Resolved'
  },
  'Rejected': {
    bg: 'bg-rose-50 text-rose-700 border-rose-300',
    icon: XCircle,
    label: 'Rejected'
  }
};

const StatusBadge = ({ status, size = 'sm' }) => {
  const config = statusConfig[status] || statusConfig['Submitted'];
  const Icon = config.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${config.bg} ${
        isSm ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      <Icon className={isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
