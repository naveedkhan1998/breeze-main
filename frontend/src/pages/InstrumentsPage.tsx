import { ChangeEvent, useState } from "react";
import { TextInput, Tabs, Card } from "flowbite-react";
import { HiSearch, HiAdjustments } from "react-icons/hi";
import Instrument from "../components/Instrument";
import { motion, AnimatePresence } from "framer-motion";

const InstrumentsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="min-h-screen p-2 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 sm:p-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-6xl mx-auto mt-4 sm:mt-8">
        <Card>
          <h1 className="mb-4 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 sm:text-3xl">Instruments</h1>
          <div className="sticky z-10 p-4 mb-4 bg-white rounded-lg shadow-md dark:shadow-slate-600 top-16 dark:bg-gray-800">
            <div className="flex items-center space-x-2">
              <TextInput id="searchTerm" type="text" icon={HiSearch} placeholder="Search instruments..." value={searchTerm} onChange={handleChange} required className="flex-grow" />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 text-gray-500 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                aria-label="Toggle filters"
              >
                <HiAdjustments className="w-6 h-6" />
              </button>
            </div>
            <AnimatePresence>
              {showFilters && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="mt-4 space-y-2">
                  {/* Add filter options here */}
                  <div className="flex items-center space-x-2">
                    <label htmlFor="series" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Series:
                    </label>
                    <select
                      id="series"
                      className="block w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">All</option>
                      <option value="EQ">EQ</option>
                      <option value="FUT">FUT</option>
                      <option value="OPT">OPT</option>
                    </select>
                  </div>
                  {/* Add more filter options as needed */}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Tabs aria-label="Instrument tabs" style="underline" className="w-full">
            <Tabs.Item title="NSE">
              <Instrument exchange="NSE" searchTerm={searchTerm} />
            </Tabs.Item>
            <Tabs.Item title="BSE">
              <Instrument exchange="BSE" searchTerm={searchTerm} />
            </Tabs.Item>
            <Tabs.Item title="NFO">
              <Instrument exchange="FON" searchTerm={searchTerm} />
            </Tabs.Item>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
};

export default InstrumentsPage;
