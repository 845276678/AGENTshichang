import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onCheckedChange,
  disabled = false,
  className,
  children,
}) => {
  const handleClick = () => {
    if (!disabled) {
      onCheckedChange(!checked);
    }
  };

  return (
    <label className={cn('flex items-center space-x-2 cursor-pointer', disabled && 'cursor-not-allowed opacity-50', className)}>
      <div
        className={cn(
          'relative flex h-4 w-4 items-center justify-center rounded border-2 transition-all',
          checked
            ? 'border-blue-600 bg-blue-600 text-white'
            : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800',
          !disabled && 'hover:border-blue-500',
          disabled && 'cursor-not-allowed'
        )}
        onClick={handleClick}
      >
        {checked && (
          <Check className="h-3 w-3" />
        )}
      </div>
      {children && (
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {children}
        </span>
      )}
    </label>
  );
};