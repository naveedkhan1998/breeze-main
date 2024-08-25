import {  createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../app/store";

interface ModeState {
  mode?: boolean;
}

const initialState: ModeState = {
  mode: false,
};

const darkModeSlice = createSlice({
  name: "mode",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = !state.mode;
    },
  },
});
export const { setMode } = darkModeSlice.actions;

export default darkModeSlice.reducer;

export const getMode = (state: RootState) => state.mode.mode;
