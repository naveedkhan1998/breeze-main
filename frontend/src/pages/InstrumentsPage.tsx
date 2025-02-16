import { ChangeEvent, useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Instrument from "../components/Instrument";

const InstrumentsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="min-h-screen p-2 bg-gradient-to-b from-background to-muted sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl mx-auto mt-4 sm:mt-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text sm:text-3xl">
              Instruments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="sticky z-10 p-4 mb-4 bg-white rounded-lg shadow-md dark:bg-zinc-900 top-16 ">
              <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="searchTerm"
                    type="text"
                    placeholder="Search instruments..."
                    value={searchTerm}
                    onChange={handleChange}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>

            <Tabs defaultValue="NSE" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="NSE" className="flex-1">
                  NSE
                </TabsTrigger>
                <TabsTrigger value="BSE" className="flex-1">
                  BSE
                </TabsTrigger>
                <TabsTrigger value="NFO" className="flex-1">
                  NFO
                </TabsTrigger>
              </TabsList>
              <TabsContent value="NSE">
                <Instrument exchange="NSE" searchTerm={searchTerm} />
              </TabsContent>
              <TabsContent value="BSE">
                <Instrument exchange="BSE" searchTerm={searchTerm} />
              </TabsContent>
              <TabsContent value="NFO">
                <Instrument exchange="FON" searchTerm={searchTerm} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default InstrumentsPage;
