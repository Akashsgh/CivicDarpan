import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { MapPin, Calendar, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

const ComplaintCard = ({ complaint }) => {
  const {
    complaintId,
    title,
    description,
    category,
    status,
    priority,
    location,
    imageUrl,
    aiCategory,
    aiConfidence,
    isDuplicate,
    duplicateOf,
    createdAt
  } = complaint;

  const formattedDate = new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      
      {/* Header Info */}
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60">
            {complaintId}
          </span>
          <StatusBadge status={status} size="sm" />
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {description}
          </p>
        </div>

        {/* Thumbnail if present */}
        {imageUrl && (
          <div className="h-32 w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Metadata Tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {category}
          </span>
          <PriorityBadge priority={priority} size="sm" />
          
          {/* AI Metadata Pill */}
          {aiConfidence && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              <Sparkles className="w-2.5 h-2.5 text-blue-600" />
              AI Conf: {(aiConfidence * 100).toFixed(0)}%
            </span>
          )}

          {/* Duplicate Alert Pill */}
          {isDuplicate && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full">
              <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
              Potential Duplicate
            </span>
          )}
        </div>
      </div>

      {/* Footer Details */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1 truncate max-w-[180px]">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{location?.landmark || location?.address || 'Location Pinned'}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </span>
          <Link
            to={`/complaints/${complaintId}`}
            className="text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-0.5"
          >
            Track <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

    </div>
  );
};

export default ComplaintCard;
