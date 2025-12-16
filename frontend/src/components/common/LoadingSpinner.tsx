interface LoadingSpinnerProps {
  color?: string;
  message?: string;
}

export default function LoadingSpinner({
  color = 'border-blue-600',
  message = '처리 중...'
}: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${color} mx-auto mb-4`}></div>
        <div className="text-gray-600">{message}</div>
      </div>
    </div>
  );
}
