import React, { ChangeEvent, useState } from 'react';
import { Search, CalendarIcon } from 'lucide-react';
import {
  PageLayout,
  PageHeader,
  PageSubHeader,
  PageActions,
  PageContent,
} from '@/components/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Instrument from './components/Instrument';

interface ExchangeTabProps {
  value: string;
  label: string;
}

interface SearchBarProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

interface Exchange {
  value: string;
  label: string;
  instrumentExchange: string;
}

const ExchangeTab: React.FC<ExchangeTabProps> = ({ value, label }) => (
  <TabsTrigger
    value={value}
    className="flex-1 py-3 text-sm font-medium transition-colors hover:text-primary"
  >
    {label}
  </TabsTrigger>
);

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => (
  <div className="relative w-full max-w-md">
    <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
    <Input
      type="text"
      placeholder="Search instruments..."
      value={value}
      onChange={onChange}
      className="w-full h-10 pl-10 pr-4 bg-background/50 backdrop-blur-sm"
    />
  </div>
);

const InstrumentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [optionType, setOptionType] = useState<string>('');
  const [strikePrice, setStrikePrice] = useState<number | null>(null);
  const [expiryAfter, setExpiryAfter] = useState<Date | undefined>(undefined);
  const [expiryBefore, setExpiryBefore] = useState<Date | undefined>(undefined);

  const exchanges: Exchange[] = [
    { value: 'NSE', label: 'NSE', instrumentExchange: 'NSE' },
    { value: 'BSE', label: 'BSE', instrumentExchange: 'BSE' },
    { value: 'NFO', label: 'NFO', instrumentExchange: 'FON' },
  ];

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <PageLayout
      header={
        <PageHeader>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text">
            Instruments Explorer
          </span>
        </PageHeader>
      }
      subheader={
        <PageSubHeader>
          Search and subscribe to instruments across different exchanges
        </PageSubHeader>
      }
      actions={
        <PageActions>
          <SearchBar value={searchTerm} onChange={handleSearchChange} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">{optionType || 'Option Type'}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setOptionType('')}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOptionType('CE')}>
                CE
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOptionType('PE')}>
                PE
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Input
            type="number"
            placeholder="Strike Price"
            value={strikePrice === null ? '' : strikePrice}
            onChange={e =>
              setStrikePrice(
                e.target.value === '' ? null : Number(e.target.value)
              )
            }
            className="w-full max-w-[150px]"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-[180px] justify-start text-left font-normal',
                  !expiryAfter && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {expiryAfter ? format(expiryAfter, 'PPP') : 'Expiry After'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={expiryAfter}
                onSelect={setExpiryAfter}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-[180px] justify-start text-left font-normal',
                  !expiryBefore && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {expiryBefore ? format(expiryBefore, 'PPP') : 'Expiry Before'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={expiryBefore}
                onSelect={setExpiryBefore}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </PageActions>
      }
    >
      <PageContent>
        <Card className="backdrop-blur-sm bg-background/95">
          <CardContent className="p-6">
            <Tabs defaultValue="NSE" className="w-full">
              <TabsList className="w-full mb-6 bg-muted/50">
                {exchanges.map(exchange => (
                  <ExchangeTab
                    key={exchange.value}
                    value={exchange.value}
                    label={exchange.label}
                  />
                ))}
              </TabsList>

              {exchanges.map(exchange => (
                <TabsContent key={exchange.value} value={exchange.value}>
                  <div className="border rounded-lg bg-card">
                    <Instrument
                      exchange={exchange.instrumentExchange}
                      searchTerm={searchTerm}
                      optionType={optionType}
                      strikePrice={strikePrice}
                      expiryAfter={
                        expiryAfter ? format(expiryAfter, 'yyyy-MM-dd') : ''
                      }
                      expiryBefore={
                        expiryBefore ? format(expiryBefore, 'yyyy-MM-dd') : ''
                      }
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </PageContent>
    </PageLayout>
  );
};

export default InstrumentsPage;
