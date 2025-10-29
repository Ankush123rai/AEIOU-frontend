import clsx from 'clsx';

interface ProgressBarProps {
  progress: number;
  className?: string;
}

export function ProgressBar({ progress, className }: ProgressBarProps) {
  return (
    <div className={clsx('w-full bg-gray-200 rounded-full h-2', className)}>
      <div
        className="bg-secondary-500 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}