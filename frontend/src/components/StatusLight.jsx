import React from 'react';
import { cn } from '../lib/utils';

const StatusLight = ({ status, className }) => {
  const isOk = status === 'ok';
  
  return (
    <div className={cn(
      "relative inline-flex items-center justify-center w-4 h-4 rounded-full",
      isOk ? "bg-green-500" : "bg-red-500",
      className
    )}>
      <div 
        className={cn(
          "absolute w-6 h-6 rounded-full opacity-75 animate-ping",
          isOk ? "bg-green-400" : "bg-red-400"
        )}
      />
      <div 
        className={cn(
          "relative inline-flex items-center justify-center w-2 h-2 rounded-full",
          isOk ? "bg-green-300" : "bg-red-300"
        )}
      />
      <span className="sr-only">{isOk ? 'Status OK' : 'Status Error'}</span>
    </div>
  );
};

export default StatusLight;