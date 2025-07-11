export type Credentials = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: {
    access: string;
    refresh: string;
  };
};

export interface RefreshTokenResult {
  data?: {
    access?: string;
    refresh?: string;
  };
}

export interface PercentageInstrument {
  percentage: number;
  is_loading: boolean;
}
export interface Instrument {
  id: number;
  percentage: PercentageInstrument;
  stock_token: string | null;
  token: string | null;
  instrument: string | null;
  short_name: string | null;
  series: string | null;
  company_name: string | null;
  expiry: string | null;
  strike_price: number | null;
  option_type: string | null;
  exchange_code: string | null;
  exchange: number;
}

export type SubscribedInstrument = Instrument;

export type Candle = {
  open: number;
  high: number;
  low: number;
  close: number;
  date: string;
  volume?: number;
  time?: string | number;
};

export interface BreezeAccount {
  id: number;
  name: string;
  api_key: string;
  api_secret: string;
  session_token: string;
  last_updated: string;
  is_active: boolean;
  user: number;
}
// create breeze is breeze account omitting the user field
export type CreateBreeze = Omit<
  BreezeAccount,
  'user' | 'id' | 'last_updated' | 'is_active' | 'session_token'
>;

export interface Indicator {
  name: string;
  active: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
}

export interface User {
  id: number;
  email: string;
  name: string;
  avatar: string;
  tc: boolean;
  is_admin: boolean;
  auth_provider: string;
}

export interface UserRegistration
  extends Omit<User, 'id' | 'is_admin' | 'avatar' | 'auth_provider'> {
  password: string;
  password2: string;
}

export interface GetCandles {
  id: number;
  tf: string;
}

export interface GetInstruments {
  exchange?: string;
  search?: string;
  optionType?: string;
  strikePrice?: number | null;
  expiryAfter?: string;
  expiryBefore?: string;
  instrumentType?: 'OPTION' | 'FUTURE' | undefined;
}

export interface GetPaginatedCandles {
  id: number;
  tf: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedCandles {
  count: number;
  next: string | null;
  previous: string | null;
  results: Candle[];
}
