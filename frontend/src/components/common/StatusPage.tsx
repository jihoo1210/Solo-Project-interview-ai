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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <StatusIcon type={type} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          {subMessage && (
            <p className="text-sm text-gray-500 mb-4">{subMessage}</p>
          )}
          {children}
          {linkTo && linkText && (
            <Link
              to={linkTo}
              className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
            >
              {linkText}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
