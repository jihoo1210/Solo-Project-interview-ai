import { Link } from 'react-router-dom';
import StatusIcon from './StatusIcon';

type StatusType = 'success' | 'error' | 'warning' | 'info' | 'email';

interface StatusPageProps {
  type: StatusType;
  title: string;
  message: string;
  subMessage?: string;
  linkTo?: string;
  linkText?: string;
  children?: React.ReactNode;
}

export default function StatusPage({
  type,
  title,
  message,
  subMessage,
  linkTo,
  linkText,
  children
}: StatusPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-xl shadow-md p-8">
          <StatusIcon type={type} />
          <h2 className="text-2xl font-bold text-text mb-2">{title}</h2>
          <p className="text-text-muted mb-6">{message}</p>
          {subMessage && (
            <p className="text-sm text-text-muted mb-4">{subMessage}</p>
          )}
          {children}
          {linkTo && linkText && (
            <Link
              to={linkTo}
              className="inline-flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
            >
              {linkText}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
