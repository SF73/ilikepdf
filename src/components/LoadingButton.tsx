import React from 'react';
import { Button } from '@/components/ui/button'; 
const LoadingButton: React.FC<{ children: React.ReactNode; loading?: boolean; [key: string]: any }> = ({ children, loading = false, ...props }) => {
  return (
    <Button {...props} disabled={loading || props.disabled}>
      {loading ? 'Loading...' : children}
    </Button>
  );
};

export default LoadingButton;
