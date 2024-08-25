import { ChangeEvent, useState } from "react";
import { TextInput, Tabs, Card } from "flowbite-react";
import { HiSearch } from "react-icons/hi";
import Instrument from "../components/Instrument";

const InstrumentsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="min-h-screen p-2 bg-gray-100 dark:bg-gray-900 sm:p-4">
      <Card className="w-full max-w-6xl mx-auto mt-4 sm:mt-8">
        <h1 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">Instruments</h1>
        <div className="sticky z-10 p-4 mb-4 bg-white rounded-lg shadow-md dark:shadow-slate-600 top-16 dark:bg-gray-800">
          <TextInput id="searchTerm" type="text" icon={HiSearch} placeholder="Search instruments..." value={searchTerm} onChange={handleChange} required />
        </div>
        <Tabs aria-label="Instrument tabs" style="underline" className="w-full">
          <Tabs.Item active title="NSE">
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
    </div>
  );
};

export default InstrumentsPage;
