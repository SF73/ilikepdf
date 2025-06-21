import React from 'react';
import { cn } from '@/lib/utils';
interface ToolLayoutProps {
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const ToolLayout: React.FC<ToolLayoutProps> = ({ title, description, children, className }) => {
  return (
    <div className="flex justify-center">
      <div className={cn(className, "max-w-6xl w-full p-4 space-y-6")}>
        <div>
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <div>{description}</div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default ToolLayout;
