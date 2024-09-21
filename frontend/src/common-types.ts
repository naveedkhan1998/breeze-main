export type Credentials = {
  email: string;
  password: string;
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

export type Candle = {
  open: number;
  high: number;
  low: number;
  close: number;
  date: string;
  volume?: number;
  time?:string
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

export interface Indicator {
  name: string;
  active: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
}