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

export interface Percentage {
  percentage: number;
  is_loading: boolean;
}

export interface Instrument {
  id: number;
  symbol?: string;
  exchange_code: string;
  instrument_token?: string;
  exchange_token?: string;
  tradingsymbol?: string;
  name?: string;
  company_name?: string;
  last_price?: number;
  expiry?: string;
  strike_price?: number;
  tick_size?: number;
  lot_size?: number;
  instrument_type?: string;
  option_type?: string;
  exchange?: string;
  series?: string;
  segment?: string;
  percentage?: Percentage;
}

export interface Order {
  id: number;
  order_id: string;
  exchange_order_id: string;
  tradingsymbol: string;
  status: string;
  transaction_type: string;
  average_price?: number;
  price: number;
  instrument: Instrument;
}

export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

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

export interface ChartIndicator {
  id: string;
  name: string;
  type: "overlay" | "separate" | "volume";
  isEnabled: boolean;
  options?: {
    period?: number;
    source?: "close" | "open" | "high" | "low";
    [key: string]: number | string | boolean | undefined;
  };
  color?: string;
}

export interface Trade {
  time: string;
  price: number;
  volume: number;
  side: "buy" | "sell";
}

export interface Indicator {
  name: string;
  active: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
}
