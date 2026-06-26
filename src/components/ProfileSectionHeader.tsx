import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil } from 'lucide-react';

export type ProfileSectionId =
  | 'basic'
  | 'education'
  | 'achievements'
  | 'activities'
  | 'certificates'
  | 'work-drive';

interface Props {
  icon: React.ReactNode;
  title: string;
  sectionId: ProfileSectionId;
  editable?: boolean;
  canAdd?: boolean;
  className?: string;
}

export function profileSectionEditUrl(sectionId: ProfileSectionId, add = false): string {
  const hash = `#section-${sectionId}`;
  return add ? `/staff/edit?add=1${hash}` : `/staff/edit${hash}`;
}

export const ProfileSectionHeader: React.FC<Props> = ({
  icon,
  title,
  sectionId,
  editable = false,
  canAdd = true,
  className = 'mb-6',
}) => (
  <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3 min-w-0">
      {icon}
      <span className="truncate">{title}</span>
    </h3>
    {editable && (
      <div className="flex items-center gap-2 shrink-0">
        {canAdd && (
          <Link
            to={profileSectionEditUrl(sectionId, true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
          >
            <Plus size={14} />
            เพิ่ม
          </Link>
        )}
        <Link
          to={profileSectionEditUrl(sectionId)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <Pencil size={14} />
          แก้ไข
        </Link>
      </div>
    )}
  </div>
);
