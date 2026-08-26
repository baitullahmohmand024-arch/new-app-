import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { ArrowLeft, Clock } from 'lucide-react';

interface PlaceholderViewProps {
  title: string;
  description: string;
  targetMilestone: string;
  icon: React.ReactNode;
  onBackToStudy: () => void;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  title,
  description,
  targetMilestone,
  icon,
  onBackToStudy,
}) => {
  return (
    <div className="max-w-md mx-auto py-8 px-4 text-center">
      <Card className="py-10 px-6 border-dashed border-2 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
          {icon}
        </div>

        <Badge variant="info" icon={<Clock className="w-3 h-3" />} className="mb-3">
          Planned for {targetMilestone}
        </Badge>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6 leading-relaxed">
          {description}
        </p>

        <Button
          variant="secondary"
          size="md"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={onBackToStudy}
        >
          Return to Study Hub
        </Button>
      </Card>
    </div>
  );
};
