import {
  getToken,
  getUser,
  removeUser,
  storeUser,
} from '@/api/localStorageService';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from 'src/app/store';
import { User } from '@/types/common-types';

const { access_token } = getToken();
const storedUser = getUser();

// Define a type for the slice state
interface TokenState {
  access?: string | null;
  user?: User | null;
}

const initialState: TokenState = {
  access: access_token || null,
  user: storedUser || null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<TokenState>) => {
      const { access, user } = action.payload;
      state.access = access;
      state.user = user;
      if (user) {
        storeUser(user);
      }
    },
    logOut: state => {
      state.access = null;
      state.user = null;
      removeUser();
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;

export default authSlice.reducer;

export const getCurrentToken = (state: RootState) => state.auth.access;
export const getLoggedInUser = (state: RootState) => state.auth.user;
