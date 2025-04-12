import React from 'react';

const ProgressBar = ({ percent = 0, message = "" }) => {
  return (
    <div className="w-full mt-4 mb-4">
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-blue-500 h-3 transition-all duration-200 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      {message && (
        <p className="text-sm text-gray-600 mt-1 text-center">
          {message}
        </p>
      )}
    </div>
  );
};

export default ProgressBar;
