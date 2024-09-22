import React, { memo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchSymbols } from "../../services/polygon";
import debounce from "lodash/debounce";

interface CompanySearchProps {
  onSelect: (symbol: string) => void;
}

const CompanySearch: React.FC<CompanySearchProps> = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const debounceSearch = debounce((term: string) => {
    setDebouncedSearchTerm(term);
  }, 500);

  useEffect(() => {
    if (searchTerm) {
      debounceSearch(searchTerm);
    }

    return () => {
      debounceSearch.cancel();
    };
  }, [searchTerm]);

  const { data, isLoading } = useQuery({
    queryKey: ["searchSymbols", debouncedSearchTerm],
    queryFn: () => searchSymbols(debouncedSearchTerm),
    enabled:
      debouncedSearchTerm.length > 1 && debouncedSearchTerm !== selectedSymbol,
  });

  const handleSelect = (symbol: string, name: string) => {
    setSelectedSymbol(symbol);
    setSearchTerm(name);
    setShowDropdown(false);
    onSelect(symbol);
  };

  return (
    <div className="relative">
      <div className="relative w-full">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          className="border p-2 rounded-md w-full pr-10"
          placeholder="Search for a company"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="animate-spin h-5 w-5 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
              ></path>
            </svg>
          </div>
        )}
      </div>
      {showDropdown && data && data.results && (
        <ul className="absolute z-10 bg-white border w-full mt-2 max-h-48 overflow-auto rounded-md shadow-lg">
          {data.results.map((result: any, index: number) => (
            <li
              key={index}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(result.ticker, result.name)}
            >
              {result.name} ({result.ticker})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default memo(CompanySearch);
