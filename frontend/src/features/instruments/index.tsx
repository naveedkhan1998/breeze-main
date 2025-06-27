import React, { ChangeEvent, useState } from "react";
import { Search } from "lucide-react";
import {
  PageLayout,
  PageHeader,
  PageSubHeader,
  PageActions,
  PageContent,
} from "@/components/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Instrument from "./components/Instrument";

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
  const [searchTerm, setSearchTerm] = useState<string>("");

  const exchanges: Exchange[] = [
    { value: "NSE", label: "NSE", instrumentExchange: "NSE" },
    { value: "BSE", label: "BSE", instrumentExchange: "BSE" },
    { value: "NFO", label: "NFO", instrumentExchange: "FON" },
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
        </PageActions>
      }
    >
      <PageContent>
        <Card className="backdrop-blur-sm bg-background/95">
          <CardContent className="p-6">
            <Tabs defaultValue="NSE" className="w-full">
              <TabsList className="w-full mb-6 bg-muted/50">
                {exchanges.map((exchange) => (
                  <ExchangeTab
                    key={exchange.value}
                    value={exchange.value}
                    label={exchange.label}
                  />
                ))}
              </TabsList>

              {exchanges.map((exchange) => (
                <TabsContent key={exchange.value} value={exchange.value}>
                  <div className="border rounded-lg bg-card">
                    <Instrument
                      exchange={exchange.instrumentExchange}
                      searchTerm={searchTerm}
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
