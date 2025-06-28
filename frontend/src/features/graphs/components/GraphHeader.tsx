import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { Helmet } from 'react-helmet';
import {
  HiArrowLeft,
  HiArrowsExpand,
  HiChartBar,
  HiCog,
  HiColorSwatch,
  HiDotsVertical,
  HiDownload,
  HiPause,
  HiPlay,
  HiRefresh,
  HiTrendingUp,
  HiX,
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/app/hooks';
import {
  selectAutoRefresh,
  selectIsFullscreen,
  selectShowControls,
  selectShowVolume,
  selectTimeframe,
  setAutoRefresh,
  setShowControls,
  setShowVolume,
} from '../graphSlice';
import { Instrument } from '@/types/common-types';
import { ModeToggle } from '@/components/ModeToggle';

interface GraphHeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  obj: Instrument;
  handleDownload: () => void;
  refetch: () => void;
  toggleFullscreen: () => void;
}

const GraphHeader: React.FC<GraphHeaderProps> = ({
  data,
  obj,
  handleDownload,
  refetch,
  toggleFullscreen,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const timeframe = useAppSelector(selectTimeframe);
  const autoRefresh = useAppSelector(selectAutoRefresh);
  const showVolume = useAppSelector(selectShowVolume);
  const showControls = useAppSelector(selectShowControls);
  const isFullscreen = useAppSelector(selectIsFullscreen);
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm">
      <Helmet>
        <title>{obj?.company_name} - Breeze</title>
      </Helmet>
      <div className="flex items-center justify-between h-20 px-4 mx-auto sm:px-6 lg:px-8">
        {/* Left Section - Navigation & Title */}
        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="rounded-full"
                >
                  <HiArrowLeft className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Go back</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {obj?.company_name || 'Chart'}
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{obj?.exchange_code || 'N/A'}</span>
              <Separator orientation="vertical" className="h-3" />
              <span>{timeframe}m</span>
              <Separator orientation="vertical" className="h-3" />
              <span>{data?.data?.length || 0} data points</span>
              {autoRefresh && (
                <>
                  <Separator orientation="vertical" className="h-3" />
                  <div className="flex items-center gap-1.5 text-green-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Live</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Controls */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={autoRefresh ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => dispatch(setAutoRefresh(!autoRefresh))}
                  className="rounded-full"
                >
                  {autoRefresh ? (
                    <HiPause className="w-5 h-5" />
                  ) : (
                    <HiPlay className="w-5 h-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {autoRefresh ? 'Pause Live Updates' : 'Enable Live Updates'}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={refetch}
                  className="rounded-full"
                >
                  <HiRefresh className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh Data</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showControls ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => dispatch(setShowControls(!showControls))}
                  className="rounded-full"
                >
                  <HiCog className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Controls</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="rounded-full"
                >
                  {isFullscreen ? (
                    <HiX className="w-5 h-5" />
                  ) : (
                    <HiArrowsExpand className="w-5 h-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <HiDotsVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => dispatch(setShowVolume(!showVolume))}
              >
                <HiChartBar className="w-4 h-4 mr-2" />
                <span>{showVolume ? 'Hide' : 'Show'} Volume</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <HiDownload className="w-4 h-4 mr-2" />
                <span>Export as CSV</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <HiTrendingUp className="w-4 h-4 mr-2" />
                      <span>Add Indicator</span>
                    </DropdownMenuItem>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Coming soon!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuItem>
                <HiColorSwatch className="w-4 h-4 mr-2" />
                <span>Customize Theme</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default GraphHeader;
