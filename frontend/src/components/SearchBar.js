import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ keyword });
  };

  const resetForm = () => {
    setKeyword('');
    onSearch({ keyword: '' });
  };

  return (
    <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg overflow-hidden mb-8">
      {/* Decorative elements - hidden on small screens */}
      <div className="hidden md:block absolute top-0 right-0 -mt-1 -mr-1">
        <div className="w-16 h-16 rounded-full bg-emerald-400 opacity-20 blur-md"></div>
      </div>
      <div className="hidden md:block absolute bottom-0 left-0 -mb-1 -ml-1">
        <div className="w-12 h-12 rounded-full bg-teal-400 opacity-20 blur-md"></div>
      </div>
      
      <div className="p-1 sm:p-2 md:p-1">
        <div className="bg-white rounded-lg p-1 sm:p-2">
          <div className="flex justify-between items-center mb-2 sm:mb-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 px-2 sm:px-3">Search Books</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="px-1 sm:px-2">
            <div className="relative">
              {/* Search icon - adjusted for mobile */}
              <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Input field - responsive sizing */}
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="block w-full pl-10 sm:pl-12 pr-16 sm:pr-20 py-3 sm:py-4 text-base sm:text-lg border-2 border-emerald-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50"
                placeholder="Search by book name, author, or keyword..."
              />
              
              {/* Search button - responsive layout */}
              <div className="absolute inset-y-0 right-0 flex py-1 pr-1 sm:py-1.5 sm:pr-1.5">
                <button
                  type="submit"
                  className="inline-flex items-center px-3 sm:px-4 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-r-lg text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-md"
                >
                  <span className="hidden sm:inline">Search</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 sm:ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Reset button - responsive layout */}
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-emerald-700 hover:text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-md transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Clear Search</span>
                <span className="sm:hidden">Clear</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;