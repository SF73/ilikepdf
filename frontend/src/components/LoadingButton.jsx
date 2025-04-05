import React from 'react';

const LoadingButton = ({ children, loading, ...props }) => {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default LoadingButton;
