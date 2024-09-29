"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const query = formData.get("query");

    setLoading(true);
    const res = await fetch(`/api/searchprod?query=${query}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (data.success) {
      setProducts(data.products);
    }

    setLoading(false);
  };
  return (
    <main className=" mx-auto flex flex-col mt-5 justify-center px-5 items-center ">
      <form onSubmit={onSubmit} className="flex gap-2 w-full md:px-28 px-0 ">
        <Input
          name="query"
          placeholder="search..."
          className="w-full"
          disabled={loading}
        />
        <Button disabled={loading}>submit</Button>
      </form>
      {loading && (
        <div className="text-center py-4">loading... please wait...</div>
      )}
      <div className="grid xl:grid-cols-4 md:grid-cols-3 grid-cols-1 gap-4 py-4">
        {products?.map((product, i) => (
          <Card key={i}>
            <CardHeader className="flex gap-2">
              <CardTitle className="text-lg font-semibold">
                {product.title}
              </CardTitle>
              <div className="text-muted-foreground">
                <p className="text-lg">{`No of reviews : ${product.reviews}`}</p>
                <p className="text-lg">{`${product.stars}`}</p>
              </div>
            </CardHeader>
            <CardContent className="relative h-96 py-4">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover border "
              />
            </CardContent>
            <CardFooter className="flex justify-between items-center mt-5">
              <p className="text-lg font-semibold">{product.price}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
