import { useEffect, useState } from 'react';

const ERROR_MESSAGES = {
  400: 'Bad Request',
  401: 'Not Authenticated - Please Login',
  403: 'Access Denied',
  404: 'Page Not Found',
  500: 'Internal Server Error',
  503: 'Service Currently Unavailable',
};

export const useErrorMessage = (statusCode) => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (statusCode === undefined || statusCode === null) return;
    const code = Number(statusCode);
    const msg = ERROR_MESSAGES[code] || 'Unknown error';
    setMessage(msg);
    const timer = setTimeout(() => setMessage(''), 6000);
    return () => clearTimeout(timer);
  }, [statusCode]);

  return message;
};

