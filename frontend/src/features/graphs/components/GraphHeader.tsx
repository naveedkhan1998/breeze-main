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
  HiViewGrid,
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
import { Badge } from '@/components/ui/badge';

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
    <header className="sticky top-0 z-50 border-b shadow-lg border-border/50 ">
      <Helmet>
        <title>{obj?.company_name} - ICICI Breeze</title>
      </Helmet>
      <div className="flex items-center justify-between px-6 py-5">
        {/* Left Section - Navigation & Title */}
        <div className="flex items-center space-x-6">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="p-0 transition-all duration-300 action-button w-11 h-11 rounded-xl hover:bg-gradient-to-r hover:from-accent/80 hover:to-accent/60 hover:shadow-lg"
                >
                  <HiArrowLeft className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="border-0 ">
                Go back to instruments
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex flex-col">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-sidebar-foreground via-sidebar-foreground to-sidebar-foreground/80 bg-clip-text">
                {obj?.company_name || 'Chart'}
              </h1>
              <div className="flex items-center space-x-3">
                <Badge variant="outline">{obj?.exchange_code || 'N/A'}</Badge>
                <Badge variant="outline">{timeframe}m timeframe</Badge>
              </div>
            </div>
            <div className="flex items-center mt-2 space-x-6">
              {autoRefresh && (
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-chart-2 live-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-chart-2 animate-ping"></div>
                  </div>
                  <Badge variant="outline">
                    <HiPlay className="w-3 h-3 mr-1" />
                    Live Updates
                  </Badge>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <HiChartBar className="w-4 h-4" />
                <span className="font-medium">
                  {data?.data?.length || 0} data points loaded
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Enhanced Controls */}
        <div className="flex items-center space-x-4">
          {/* Quick Actions Panel */}
          <div className="flex items-center p-1.5 space-x-1 rounded-xl  shadow-sm">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dispatch(setAutoRefresh(!autoRefresh))}
                    className={`action-button h-9 px-4 rounded-lg transition-all duration-300 ${
                      autoRefresh
                        ? 'bg-gradient-to-r from-chart-2/20 to-chart-2/10 text-chart-2 shadow-sm hover:shadow-md'
                        : 'hover:bg-gradient-to-r hover:from-sidebar-accent/80 hover:to-sidebar-accent/60'
                    }`}
                  >
                    {autoRefresh ? (
                      <>
                        <HiPause className="w-4 h-4 mr-2" />
                        <span className="text-xs font-medium">Pause</span>
                      </>
                    ) : (
                      <>
                        <HiPlay className="w-4 h-4 mr-2" />
                        <span className="text-xs font-medium">Live</span>
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="border-0 ">
                  {autoRefresh ? 'Pause' : 'Start'} live market updates
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dispatch(setShowVolume(!showVolume))}
                    className={`action-button h-9 px-4 rounded-lg transition-all duration-300 ${
                      showVolume
                        ? 'bg-gradient-to-r from-chart-1/20 to-chart-1/10 text-chart-1 shadow-sm hover:shadow-md'
                        : 'hover:bg-gradient-to-r hover:from-sidebar-accent/80 hover:to-sidebar-accent/60'
                    }`}
                  >
                    <HiChartBar className="w-4 h-4 mr-2" />
                    <span className="text-xs font-medium">Volume</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="border-0 ">
                  {showVolume ? 'Hide' : 'Show'} volume analysis
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dispatch(setShowControls(!showControls))}
                    className={`action-button h-9 px-4 rounded-lg transition-all duration-300 ${
                      showControls
                        ? 'bg-gradient-to-r from-chart-5/20 to-chart-5/10 text-chart-5 shadow-sm hover:shadow-md'
                        : 'hover:bg-gradient-to-r hover:from-sidebar-accent/80 hover:to-sidebar-accent/60'
                    }`}
                  >
                    <HiCog className="w-4 h-4 mr-2" />
                    <span className="text-xs font-medium">Settings</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="border-0 ">
                  Toggle chart settings panel
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Separator
            orientation="vertical"
            className="h-8 bg-gradient-to-b from-transparent via-border to-transparent"
          />

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refetch}
                    className="w-10 h-10 p-0 transition-all duration-300 action-button rounded-xl hover:bg-gradient-to-r hover:from-chart-3/20 hover:to-chart-3/10 hover:text-chart-3 hover:shadow-lg"
                  >
                    <HiRefresh className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="border-0 ">
                  Refresh market data
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownload}
                    className="w-10 h-10 p-0 transition-all duration-300 action-button rounded-xl hover:bg-gradient-to-r hover:from-chart-4/20 hover:to-chart-4/10 hover:text-chart-4 hover:shadow-lg"
                  >
                    <HiDownload className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="border-0 ">
                  Export data as CSV
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="w-10 h-10 p-0 transition-all duration-300 action-button rounded-xl hover:bg-gradient-to-r hover:from-primary/20 hover:to-primary/10 hover:text-primary hover:shadow-lg"
                  >
                    {isFullscreen ? (
                      <HiX className="w-5 h-5" />
                    ) : (
                      <HiArrowsExpand className="w-5 h-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="border-0 ">
                  {isFullscreen
                    ? 'Exit fullscreen mode'
                    : 'Enter fullscreen mode'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Enhanced More Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0 transition-all duration-300 action-button rounded-xl hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/60 hover:shadow-lg"
              >
                <HiDotsVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 border-0 shadow-2xl "
            >
              <DropdownMenuItem className="p-3 rounded-lg hover:bg-gradient-to-r hover:from-chart-1/10 hover:to-chart-1/5">
                <HiViewGrid className="w-5 h-5 mr-3 text-chart-1" />
                <div>
                  <div className="font-medium">Toggle Layout</div>
                  <div className="text-xs text-muted-foreground">
                    Switch chart arrangement
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-border to-transparent" />
              <DropdownMenuItem className="p-3 rounded-lg hover:bg-gradient-to-r hover:from-chart-2/10 hover:to-chart-2/5">
                <HiTrendingUp className="w-5 h-5 mr-3 text-chart-2" />
                <div>
                  <div className="font-medium">Add Indicator</div>
                  <div className="text-xs text-muted-foreground">
                    Technical analysis tools
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-3 rounded-lg hover:bg-gradient-to-r hover:from-chart-3/10 hover:to-chart-3/5">
                <HiColorSwatch className="w-5 h-5 mr-3 text-chart-3" />
                <div>
                  <div className="font-medium">Customize Theme</div>
                  <div className="text-xs text-muted-foreground">
                    Personalize appearance
                  </div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default GraphHeader;
