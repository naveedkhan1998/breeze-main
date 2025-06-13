import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Maximize2, Minimize2 } from "lucide-react";

import { ChartContainer } from "@/components/chart/ChartContainer";
import { ChartHeader } from "@/components/chart/ChartHeader";
import { ChartSidebar } from "@/components/chart/ChartSidebar";
import { ChartProvider, useChart } from "@/components/chart/ChartContext";
import { Instrument } from "@/common-types";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { SubChartContainer } from "@/components/chart/SubChartContainer";

interface LocationState {
  instrument: Instrument;
}

// The main chart layout with resizable panels
const ChartLayout: React.FC = () => {
  const { 
    isSidebarOpen, 
    toggleSidebar, 
    isFullscreen, 
    toggleFullscreen,
    subCharts
  } = useChart();

  return (
    <div className="flex flex-col w-full h-full">
      <ChartHeader />
      <div className="flex flex-1 w-full h-full overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="w-full">
          {/* Sidebar panel - collapsible */}
          {isSidebarOpen && (
            <>
              <ResizablePanel 
                defaultSize={20} 
                minSize={15} 
                maxSize={30} 
                className="bg-card"
              >
                <ChartSidebar />
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}
          
          {/* Chart panels container */}
          <ResizablePanel defaultSize={isSidebarOpen ? 80 : 100}>
            <div className="relative flex flex-col w-full h-full">
              {/* Toolbar with sidebar toggle and fullscreen button */}
              <div className="absolute top-0 right-0 z-10 flex gap-2 p-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleSidebar} 
                  className="w-8 h-8"
                >
                  {isSidebarOpen ? (
                    <span className="sr-only">Hide sidebar</span>
                  ) : (
                    <span className="sr-only">Show sidebar</span>
                  )}
                  <div className="flex items-center justify-center w-4 h-4">
                    {isSidebarOpen ? "←" : "→"}
                  </div>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleFullscreen} 
                  className="w-8 h-8"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              {/* Vertical resizable panels for main chart and subcharts */}
              <ResizablePanelGroup direction="vertical" className="h-full">
                {/* Main chart panel */}
                <ResizablePanel 
                  defaultSize={70} 
                  minSize={40}
                  className="relative"
                >
                  <ChartContainer />
                </ResizablePanel>
                
                {/* Sub-charts - only render if there are visible subcharts */}
                {subCharts.some(chart => chart.visible) && (
                  <>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={30}>
                      {/* Nested vertical panel group for multiple subcharts */}
                      <ResizablePanelGroup direction="vertical">
                        {subCharts.map((chart, index) => (
                          chart.visible && (
                            <React.Fragment key={chart.id}>
                              {index > 0 && <ResizableHandle withHandle />}
                              <ResizablePanel defaultSize={chart.height}>
                                <SubChartContainer 
                                  id={chart.id} 
                                  type={chart.type} 
                                />
                              </ResizablePanel>
                            </React.Fragment>
                          )
                        ))}
                      </ResizablePanelGroup>
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export const TradingViewPage: React.FC = () => {
  const location = useLocation();
  const { instrument } = (location.state as LocationState) || {};

  // Fallback instrument for development/testing
  const fallbackInstrument: Instrument = {
    id: 1,
    exchange_code: "SBIN",
    company_name: "State Bank of India",
    series: "EQUITY",
  };

  // Use the passed instrument or fallback for development
  const chartInstrument = instrument || fallbackInstrument;

  useEffect(() => {
    // Update page title
    document.title = `${chartInstrument.exchange_code} - Chart | Breeze`;

    // Clean up
    return () => {
      document.title = "Breeze";
    };
  }, [chartInstrument.exchange_code]);

  // Apply fullscreen class to the container when in fullscreen mode
  const FullscreenWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isFullscreen } = useChart();
    return (
      <div className={`fixed inset-0 z-10 ${isFullscreen ? 'top-0' : 'top-16'} bg-background`}>
        {children}
      </div>
    );
  };

  return (
    <ChartProvider instrument={chartInstrument}>
      <FullscreenWrapper>
        <ChartLayout />
      </FullscreenWrapper>
    </ChartProvider>
  );
};

export default TradingViewPage;
