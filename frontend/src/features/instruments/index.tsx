import React, { ChangeEvent, useState, useCallback, useMemo } from 'react';
import {
  Search,
  CalendarIcon,
  X,
  Filter,
  TrendingUp,
  BarChart3,
  Building2,
} from 'lucide-react';
import {
  PageLayout,
  PageHeader,
  PageSubHeader,
  PageContent,
} from '@/components/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Instrument from './components/Instrument';

interface Exchange {
  value: string;
  label: string;
  instrumentExchange: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}

const InstrumentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedExchange, setSelectedExchange] = useState<string>('NSE');

  // NFO specific filters
  const [instrumentType, setInstrumentType] = useState<'OPTION' | 'FUTURE'>(
    'OPTION'
  );
  const [optionType, setOptionType] = useState<string>('');
  const [strikePrice, setStrikePrice] = useState<number | null>(null);
  const [expiryAfter, setExpiryAfter] = useState<Date | undefined>(undefined);
  const [expiryBefore, setExpiryBefore] = useState<Date | undefined>(undefined);

  const exchanges: Exchange[] = useMemo(
    () => [
      {
        value: 'NSE',
        label: 'NSE',
        instrumentExchange: 'NSE',
        icon: Building2,
        description: 'National Stock Exchange',
        color: 'bg-blue-500',
      },
      {
        value: 'BSE',
        label: 'BSE',
        instrumentExchange: 'BSE',
        icon: BarChart3,
        description: 'Bombay Stock Exchange',
        color: 'bg-green-500',
      },
      {
        value: 'NFO',
        label: 'NFO',
        instrumentExchange: 'FON',
        icon: TrendingUp,
        description: 'NSE Futures & Options',
        color: 'bg-purple-500',
      },
    ],
    []
  );

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const resetNFOFilters = useCallback(() => {
    setOptionType('');
    setStrikePrice(null);
    setExpiryAfter(undefined);
    setExpiryBefore(undefined);
  }, []);

  const handleExchangeChange = useCallback(
    (value: string) => {
      setSelectedExchange(value);
      if (value !== 'NFO') {
        resetNFOFilters();
      }
    },
    [resetNFOFilters]
  );

  const handleInstrumentTypeChange = useCallback(
    (type: 'OPTION' | 'FUTURE') => {
      setInstrumentType(type);
      if (type === 'FUTURE') {
        setOptionType('');
        setStrikePrice(null);
      }
    },
    []
  );

  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    resetNFOFilters();
  }, [resetNFOFilters]);

  const currentExchange = useMemo(
    () => exchanges.find(ex => ex.value === selectedExchange),
    [exchanges, selectedExchange]
  );

  return (
    <PageLayout
      header={<PageHeader>Instruments Explorer</PageHeader>}
      subheader={
        <PageSubHeader>
          {selectedExchange === 'NFO'
            ? `Search and subscribe to ${instrumentType.toLowerCase()}s with advanced filtering options`
            : 'Discover and subscribe to financial instruments across multiple exchanges'}
        </PageSubHeader>
      }
    >
      <PageContent>
        <div className="flex flex-col h-full">
          {/* Content Header - Fixed */}
          <div className="mb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  {currentExchange?.label} Instruments
                </h2>
                <p className="mt-1 text-muted-foreground">
                  {selectedExchange === 'NFO'
                    ? `Browse ${instrumentType.toLowerCase()}s with advanced filtering`
                    : `Discover ${currentExchange?.description} instruments`}
                </p>
              </div>
              {searchTerm && (
                <Badge
                  variant="outline"
                  className="status-badge bg-primary/10 text-primary border-primary/20"
                >
                  Searching: "{searchTerm}"
                </Badge>
              )}
            </div>
          </div>

          {/* Sticky Search & Filter Section */}
          <div className="sticky top-0 z-50 mb-4 p-4 rounded-lg shadow-sm bg-card border flex-shrink-0">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute w-5 h-5 transform -translate-y-1/2 left-4 top-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search instruments by name, symbol, or code..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full h-12 pl-12 pr-4 text-lg shadow-sm bg-background border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                    className="absolute w-8 h-8 p-0 transform -translate-y-1/2 right-2 top-1/2 hover:bg-muted"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Exchange Selection */}
              <div className="flex flex-wrap justify-center gap-3">
                {exchanges.map(exchange => {
                  const Icon = exchange.icon;
                  const isActive = selectedExchange === exchange.value;
                  return (
                    <Button
                      key={exchange.value}
                      variant={isActive ? 'default' : 'outline'}
                      onClick={() => handleExchangeChange(exchange.value)}
                      className={cn(
                        'flex items-center gap-2 h-11 px-4 rounded-lg transition-all duration-200',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                          : 'hover:bg-secondary hover:scale-105'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{exchange.label}</span>
                        <span className="text-xs opacity-75">
                          {exchange.description}
                        </span>
                      </div>
                      {isActive && (
                        <Badge
                          variant="secondary"
                          className="ml-2 bg-accent/20 text-accent-foreground"
                        >
                          Active
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>

              {/* NFO Advanced Filters */}
              <AnimatePresence>
                {selectedExchange === 'NFO' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <Card className="border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                              Advanced Filters
                            </span>
                          </div>
                          <Separator orientation="vertical" className="h-6" />

                          {/* Instrument Type */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="min-w-[130px] bg-background"
                              >
                                {instrumentType === 'OPTION'
                                  ? '📈 Options'
                                  : '📊 Futures'}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleInstrumentTypeChange('OPTION')
                                }
                              >
                                📈 Options
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleInstrumentTypeChange('FUTURE')
                                }
                              >
                                📊 Futures
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {/* Option Type (Only for Options) */}
                          {instrumentType === 'OPTION' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="min-w-[120px] bg-background"
                                >
                                  {optionType
                                    ? optionType === 'CE'
                                      ? '📞 Call'
                                      : '📉 Put'
                                    : 'Option Type'}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onClick={() => setOptionType('')}
                                >
                                  All Types
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setOptionType('CE')}
                                >
                                  📞 Call (CE)
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setOptionType('PE')}
                                >
                                  📉 Put (PE)
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}

                          {/* Strike Price (Only for Options) */}
                          {instrumentType === 'OPTION' && (
                            <Input
                              type="number"
                              placeholder="Strike Price"
                              value={strikePrice === null ? '' : strikePrice}
                              onChange={e =>
                                setStrikePrice(
                                  e.target.value === ''
                                    ? null
                                    : Number(e.target.value)
                                )
                              }
                              className="w-32 bg-background"
                            />
                          )}

                          {/* Expiry Filters */}
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-[180px] justify-start bg-background',
                                  !expiryAfter && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                {expiryAfter
                                  ? format(expiryAfter, 'MMM dd, yyyy')
                                  : 'Expiry After'}
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
                                variant="outline"
                                className={cn(
                                  'w-[180px] justify-start bg-background',
                                  !expiryBefore && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                {expiryBefore
                                  ? format(expiryBefore, 'MMM dd, yyyy')
                                  : 'Expiry Before'}
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

                          {/* Clear Filters */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFilters}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Clear All
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Instruments Display - Flexible height */}
          <div className="flex-1 overflow-hidden">
            <Card className="shadow-xl h-full">
              <CardContent className="p-0 h-full">
                {useMemo(
                  () => (
                    <Instrument
                      exchange={currentExchange?.instrumentExchange || 'NSE'}
                      searchTerm={searchTerm}
                      optionType={selectedExchange === 'NFO' ? optionType : ''}
                      strikePrice={
                        selectedExchange === 'NFO' ? strikePrice : null
                      }
                      expiryAfter={
                        selectedExchange === 'NFO' && expiryAfter
                          ? format(expiryAfter, 'yyyy-MM-dd')
                          : ''
                      }
                      expiryBefore={
                        selectedExchange === 'NFO' && expiryBefore
                          ? format(expiryBefore, 'yyyy-MM-dd')
                          : ''
                      }
                      instrumentType={
                        selectedExchange === 'NFO' ? instrumentType : undefined
                      }
                    />
                  ),
                  [
                    currentExchange?.instrumentExchange,
                    searchTerm,
                    selectedExchange,
                    optionType,
                    strikePrice,
                    expiryAfter,
                    expiryBefore,
                    instrumentType,
                  ]
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default InstrumentsPage;
