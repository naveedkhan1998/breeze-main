import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SeriesType } from 'lightweight-charts';
import { RootState } from 'src/app/store';

interface GraphState {
  timeframe: number;
  chartType: SeriesType;
  seriesType: 'ohlc' | 'price' | 'volume';
  showVolume: boolean;
  autoRefresh: boolean;
  showControls: boolean;
  isFullscreen: boolean;
}

const initialState: GraphState = {
  timeframe: 15,
  chartType: 'Candlestick',
  seriesType: 'ohlc',
  showVolume: true,
  autoRefresh: false,
  showControls: true,
  isFullscreen: false,
};

export const graphSlice = createSlice({
  name: 'graph',
  initialState,
  reducers: {
    setTimeframe: (state, action: PayloadAction<number>) => {
      state.timeframe = action.payload;
    },
    setChartType: (state, action: PayloadAction<SeriesType>) => {
      state.chartType = action.payload;
      if (['Candlestick', 'Bar'].includes(action.payload)) {
        state.seriesType = 'ohlc';
      } else if (['Area', 'Baseline', 'Line'].includes(action.payload)) {
        state.seriesType = 'price';
      }
    },
    setShowVolume: (state, action: PayloadAction<boolean>) => {
      state.showVolume = action.payload;
    },
    setAutoRefresh: (state, action: PayloadAction<boolean>) => {
      state.autoRefresh = action.payload;
    },
    setShowControls: (state, action: PayloadAction<boolean>) => {
      state.showControls = action.payload;
    },
    setIsFullscreen: (state, action: PayloadAction<boolean>) => {
      state.isFullscreen = action.payload;
    },
  },
});

export const {
  setTimeframe,
  setChartType,
  setShowVolume,
  setAutoRefresh,
  setShowControls,
  setIsFullscreen,
} = graphSlice.actions;

export const selectTimeframe = (state: RootState) => state.graph.timeframe;
export const selectChartType = (state: RootState) => state.graph.chartType;
export const selectSeriesType = (state: RootState) => state.graph.seriesType;
export const selectShowVolume = (state: RootState) => state.graph.showVolume;
export const selectAutoRefresh = (state: RootState) => state.graph.autoRefresh;
export const selectShowControls = (state: RootState) =>
  state.graph.showControls;
export const selectIsFullscreen = (state: RootState) =>
  state.graph.isFullscreen;

export default graphSlice.reducer;
