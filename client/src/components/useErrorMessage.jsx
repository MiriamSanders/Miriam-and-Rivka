import { useMemo } from 'react';

const ERROR_MESSAGES = {
  400: 'Bad Request',
  401: 'Not Authenticated - Please Login',
  403: 'Access Denied',
  404: 'Page Not Found',
  500: 'Internal Server Error',
  503: 'Service Currently Unavailable',
};

export const useErrorMessage = (statusCode) => {
  const message = useMemo(() => {
    if (statusCode === undefined || statusCode === null) return '';
    return ERROR_MESSAGES[statusCode] || 'Unknown error';
  }, [statusCode]);

  return message;
};

