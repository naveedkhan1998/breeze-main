import {
  getToken,
  getUser,
  removeUser,
  storeUser,
  getBreezeAccountExists,
  storeBreezeAccountExists,
  removeBreezeAccountExists,
} from '@/api/localStorageService';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from 'src/app/store';
import { User, BreezeAccount } from '@/types/common-types';

const { access_token } = getToken();
const storedUser = getUser();
const storedBreezeAccountExists = getBreezeAccountExists();

// Define a type for the slice state
interface AuthState {
  access?: string | null;
  user?: User | null;
  breezeAccount?: BreezeAccount | null; // Keep in memory only, not persisted
  hasBreezeAccount?: boolean; // Only this boolean is persisted
  isBreezeAccountLoading?: boolean;
}

const initialState: AuthState = {
  access: access_token || null,
  user: storedUser || null,
  breezeAccount: null, // Always start as null, will be fetched if user is authenticated
  hasBreezeAccount: storedBreezeAccountExists,
  isBreezeAccountLoading: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ access?: string; user?: User }>
    ) => {
      const { access, user } = action.payload;
      state.access = access;
      state.user = user;
      if (user) {
        storeUser(user);
      }
    },
    setBreezeAccount: (state, action: PayloadAction<BreezeAccount | null>) => {
      state.breezeAccount = action.payload;
      // Update the boolean flag based on whether account exists
      const hasAccount = !!action.payload;
      state.hasBreezeAccount = hasAccount;
      storeBreezeAccountExists(hasAccount);
    },
    setBreezeAccountLoading: (state, action: PayloadAction<boolean>) => {
      state.isBreezeAccountLoading = action.payload;
    },
    logOut: state => {
      state.access = null;
      state.user = null;
      state.breezeAccount = null;
      state.hasBreezeAccount = false;
      state.isBreezeAccountLoading = false;
      removeUser();
      removeBreezeAccountExists();
    },
  },
});

export const {
  setCredentials,
  setBreezeAccount,
  setBreezeAccountLoading,
  logOut,
} = authSlice.actions;

export default authSlice.reducer;

export const getCurrentToken = (state: RootState) => state.auth.access;
export const getLoggedInUser = (state: RootState) => state.auth.user;
export const getBreezeAccountFromState = (state: RootState) =>
  state.auth.breezeAccount;
export const getHasBreezeAccount = (state: RootState) =>
  state.auth.hasBreezeAccount;
export const getIsBreezeAccountLoading = (state: RootState) =>
  state.auth.isBreezeAccountLoading;
