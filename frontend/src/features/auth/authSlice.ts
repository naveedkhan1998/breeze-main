import { getToken } from "@/api/localStorageService";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "src/app/store";

const { access_token } = getToken();

// Define a type for the slice state
interface TokenState {
  access?: string | null;
}

const initialState: TokenState = {
  access: access_token || null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<TokenState>) => {
      const { access } = action.payload;
      state.access = access;
    },
    logOut: (state) => {
      state.access = null;
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;

export default authSlice.reducer;

export const getCurrentToken = (state: RootState) => state.auth.access;
