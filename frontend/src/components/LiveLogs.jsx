import React from 'react';
import StatusLight from './StatusLight';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { cn } from '../lib/utils';
import {Chip} from '@mui/material';

const LiveLogs = ({log, status, className}) => {
  console.log('log:', log);
  if (!log) {
    return (
      <Card className={cn("w-full max-w-md", className)}>
        <CardContent className="flex items-center justify-center h-32">
          <span className="text-gray-500">Loading...</span>
        </CardContent>
      </Card>
    );
  }

  return (
        <Card className="w-full max-w-md">
            <div className='ml-5 mt-5'>
                <Chip label={status ? 'Live' : 'Offline'} color={status ? 'success' : 'error' }  size="small"/>
            </div>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Live Status</CardTitle>
            <StatusLight status={log.status} size="lg" />
        </CardHeader>
        <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium bg-black text-white p-2 rounded-md w-full ${
              log.status === 'ok' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {'=> '} {log.message}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveLogs;