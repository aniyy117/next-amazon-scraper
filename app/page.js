"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/searchprod?query=${encodeURIComponent(query)}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      } else {
        setError(data.error || "Failed to fetch products");
        setProducts([]);
      }
    } catch (err) {
      setError("An error occurred while fetching products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex flex-col mt-5 justify-center px-5 items-center max-w-7xl">
      {/* add color gradient feel give like amazon */}
      <h1 className="text-3xl font-bold mb-5 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-600">
        Amazon Product Search
      </h1>

      <form
        onSubmit={onSubmit}
        className="flex gap-2 w-full md:px-28 px-0 mb-5"
      >
        <Input
          name="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for products..."
          className="w-full"
          disabled={loading}
          aria-label="Search"
        />
        <Button
          disabled={loading || !query.trim()}
          type="submit"
          className="whitespace-nowrap"
        >
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      {error && (
        <div className="mb-5 w-full md:px-28 px-0">
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          Try searching for a product to see results.
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-10">
          <svg
            className="animate-spin h-5 w-5 mr-3 text-gray-600"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
          <span>Loading products...</span>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid xl:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 py-4 w-full">
          {products.map((product, i) => (
            <Card key={i} className="flex flex-col h-full rounded-xl shadow-2xl">
              {product.image ? (
                <CardContent className="relative h-64 bg-white rounded-t-xl">
                  <Image
                    src={product.image}
                    alt={product.title}
                    layout="fill"
                    objectFit="contain"
                    className="p-4"
                  />
                </CardContent>
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-100">
                  <span className="text-gray-500">No Image Available</span>
                </div>
              )}
              <CardHeader className="flex-grow">
                <CardTitle className="text-base font-semibold line-clamp-2">
                  {product.title}
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex flex-col items-start">
                {product.price && (
                  <p className="text-lg font-semibold text-green-600">
                    {product.price}
                  </p>
                )}
                {product.stars && (
                  <p className="text-sm text-yellow-500">{product.stars}</p>
                )}
                {product.reviews && (
                  <p className="text-sm text-gray-500">
                    {`${product.reviews} reviews`}
                  </p>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && products.length === 0 && query.trim() && (
        <div className="text-center py-4 text-gray-500">
          {`No results found for ${query}`}
        </div>
      )}
    </main>
  );
}
