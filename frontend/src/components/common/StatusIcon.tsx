type StatusType = 'success' | 'error' | 'warning' | 'info' | 'email';

interface StatusIconProps {
  type: StatusType;
  className?: string;
}

const iconConfig: Record<StatusType, { bg: string; color: string; path: string }> = {
  success: {
    bg: 'bg-success/20',
    color: 'text-success',
    path: 'M5 13l4 4L19 7',
  },
  error: {
    bg: 'bg-error/20',
    color: 'text-error',
    path: 'M6 18L18 6M6 6l12 12',
  },
  warning: {
    bg: 'bg-primary/20',
    color: 'text-primary',
    path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  },
  info: {
    bg: 'bg-accent/20',
    color: 'text-accent',
    path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  email: {
    bg: 'bg-primary/20',
    color: 'text-primary',
    path: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
};

export default function StatusIcon({ type, className = '' }: StatusIconProps) {
  const config = iconConfig[type];

  return (
    <div className={`w-16 h-16 ${config.bg} rounded-full flex items-center justify-center mx-auto mb-4 ${className}`}>
      <svg className={`w-8 h-8 ${config.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.path} />
      </svg>
    </div>
  );
}
