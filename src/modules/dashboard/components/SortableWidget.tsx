import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripHorizontal } from 'lucide-react';

interface SortableWidgetProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  key?: React.Key;
}

export function SortableWidget({ id, children, className }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${className || ''}`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-2 right-2 z-20 cursor-grab active:cursor-grabbing p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition-opacity"
        title="Arraste para reordenar"
      >
        <GripHorizontal className="h-4 w-4 text-muted-foreground" />
      </div>
      {children}
    </div>
  );
}
