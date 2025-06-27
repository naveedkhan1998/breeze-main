import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiXMark } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HiArrowsExpand, HiDownload, HiRefresh } from 'react-icons/hi';

interface GraphHeaderProps {
  title: string;
  onRefresh: () => void;
  onDownload: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

const GraphHeader: React.FC<GraphHeaderProps> = ({
  title,
  onRefresh,
  onDownload,
  onToggleFullscreen,
  isFullscreen,
}) => {
  const navigate = useNavigate();

  return (
    <header className="w-full bg-white border-b border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between w-full px-4 h-14">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="md:hidden"
          aria-label="Go Back"
        >
          <HiArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={onRefresh}
                  aria-label="Refresh Data"
                >
                  <HiRefresh className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh data</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={onDownload}
                  aria-label="Download CSV"
                >
                  <HiDownload className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download CSV</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={onToggleFullscreen}
                  aria-label={
                    isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'
                  }
                >
                  {isFullscreen ? (
                    <HiXMark className="w-5 h-5" />
                  ) : (
                    <HiArrowsExpand className="w-5 h-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
};

export default GraphHeader;
