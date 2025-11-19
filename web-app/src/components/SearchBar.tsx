"use client";

import { useState, useEffect } from "react";

interface SearchBarProps {
  onSearch: (query: string, useSemanticSearch: boolean) => void;
  initialValue?: string;
}

export default function SearchBar({
  onSearch,
  initialValue = "",
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [useSemanticSearch, setUseSemanticSearch] = useState(false);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim(), useSemanticSearch);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              useSemanticSearch
                ? "Try: 'funny 90s movies about friendship' or 'dark superhero films'"
                : "Search for a movie..."
            }
            className="flex-1 p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm hover:shadow-md"
          >
            Search
          </button>
        </div>

        {/* Search Mode Toggle */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-5 border-2 border-purple-200">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="semantic-toggle"
              checked={useSemanticSearch}
              onChange={(e) => setUseSemanticSearch(e.target.checked)}
              className="w-5 h-5 mt-1 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer"
            />
            <div className="flex-1">
              <label
                htmlFor="semantic-toggle"
                className="text-sm font-semibold text-gray-800 cursor-pointer select-none flex items-center gap-2"
              >
                <span>🧠 Smart Natural Language Search</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    useSemanticSearch
                      ? "bg-purple-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {useSemanticSearch ? "ON" : "OFF"}
                </span>
              </label>
              <p className="text-xs text-gray-600 mt-1">
                {useSemanticSearch
                  ? "AI-powered: Claude understands your intent + Titan ranks by meaning"
                  : "Standard keyword-based search"}
              </p>
            </div>
          </div>
        </div>

        {/* AI Explainer - Only show when enabled */}
        {useSemanticSearch && (
          <div className="bg-white border-2 border-purple-300 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-purple-900 mb-2">
                  How Smart Search Works
                </h4>
                <div className="space-y-2 text-xs text-gray-700">
                  <div className="flex items-start gap-2">
                    <span className="font-mono bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-semibold">
                      1
                    </span>
                    <p>
                      <strong className="text-purple-700">
                        Claude Sonnet 3.5
                      </strong>{" "}
                      analyzes your natural language to extract keywords, years,
                      and understand your intent
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                      2
                    </span>
                    <p>
                      <strong className="text-blue-700">
                        Amazon Titan Embeddings
                      </strong>{" "}
                      converts movies to vectors and ranks by semantic
                      similarity (not just keywords)
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-semibold">
                      3
                    </span>
                    <p>
                      <strong className="text-green-700">Smart Boosting</strong>{" "}
                      prioritizes movies matching detected time periods while
                      maintaining semantic relevance
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Example queries */}
        {useSemanticSearch && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-500 font-medium">
              Try these:
            </span>
            {[
              "funny 90s movies about friendship",
              "dark superhero fighting crime",
              "recent space adventure films",
              "classic detective mysteries",
            ].map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setQuery(example)}
                className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
