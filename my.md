# How to Build an Amazon Product Search App with Next.js 14, Puppeteer, Cheerio, and shadcn UI: A Comprehensive Guide

Hey there, fellow developers! 👋

Ever thought about creating your very own **Amazon product search tool**? Whether it's for a personal project, data analysis, or just to showcase your web scraping skills, you're in the right place! In this guide, I'll walk you through building a sleek **Amazon Product Search app** using **Next.js 14**, **Puppeteer**, **Cheerio**, and **shadcn UI** for those stylish components. Let’s dive in!

---

## Table of Contents

1. [Project Setup with Next.js 14](#project-setup-with-nextjs-14)
2. [Installing and Configuring Puppeteer, Cheerio, and shadcn UI](#installing-and-configuring-puppeteer-cheerio-and-shadcn-ui)
3. [Building a User-Friendly Home Page](#building-a-user-friendly-home-page)
4. [Identifying the Information to Retrieve on the Amazon Product Page](#identifying-the-information-to-retrieve-on-the-amazon-product-page)
5. [Creating the API for Web Scraping](#creating-the-api-for-web-scraping)
6. [Integrating Frontend with Backend API](#integrating-frontend-with-backend-api)
7. [Polishing the Application with Final Touches](#polishing-the-application-with-final-touches)
8. [Wrapping Up and Conclusion](#wrapping-up-and-conclusion)
9. [Helpful Resources](#helpful-resources)

---

## Setting Up Next.js 14

Let's kick things off by setting up our **Next.js** project.

### Step 1: Initialize Your Project

First things first, open up your terminal and run the following command to create a new Next.js app:

```bash
npx create-next-app@latest amazon-product-search
```

During the setup, you'll be prompted with a series of questions like:

```bash
What is your project named? amazon-product-search
Would you like to use TypeScript? No / Yes
Would you like to use ESLint? No / Yes
Would you like to use Tailwind CSS? No / Yes
Would you like your code inside a `src/` directory? No / Yes
Would you like to use App Router? (recommended) No / Yes
Would you like to use Turbopack for `next dev`? No / Yes
Would you like to customize the import alias (`@/*` by default)? No / Yes
What import alias would you like configured? @/*
```

Feel free to answer these prompts based on your project preferences. Once you’ve made your selections, `create-next-app` will generate a folder named `amazon-product-search` and install all the necessary dependencies.

### Step 2: Launch the Development Server

Navigate into your project directory and start the development server with:

```bash
cd amazon-product-search
npm run dev
```

Open your browser and head over to `http://localhost:3000`. You should see the default **Next.js** welcome page, indicating that everything is set up correctly.

---

## Installing Puppeteer, Cheerio, and shadcn UI

Next, we'll set up the essential libraries for **web scraping** and **UI components**.

### Puppeteer

**Puppeteer** is a powerful **Node.js** library that provides a high-level API to control **Chrome** or **Chromium** browsers programmatically. It’s perfect for automating tasks like web scraping.

Install Puppeteer by running:

```bash
npm install puppeteer
```

### Cheerio

**Cheerio** is a fast, flexible, and lean implementation of **jQuery** designed for server-side HTML manipulation. It’s fantastic for parsing and extracting data from HTML.

Install Cheerio with:

```bash
npm install cheerio
```

### shadcn UI

**shadcn UI** offers a collection of beautifully designed, accessible **React components**. We'll use it for our `Button`, `Input`, and `Card` components to ensure our app looks polished and professional.

#### Step 1: Initialize shadcn UI

Run the following command to set up shadcn UI in your project:

```bash
npx shadcn@latest init
```

For a quicker setup with default settings (like `new-york` for style, `zinc` for base color, and enabling CSS variables), you can use the `-d` flag:

```bash
npx shadcn@latest init -d
```

#### Step 2: Configure `components.json`

You'll be prompted with a few questions to set up `components.json`:

```
Which style would you like to use? › New York
Which color would you like to use as base color? › Zinc
Do you want to use CSS variables for colors? › yes
```

#### Step 3: Add shadcn UI Components

There are two ways to add components using shadcn UI:

1. **Add Components Individually**

   Use the `add` command followed by the component names:

   ```bash
   npx shadcn@latest add button input card
   ```

2. **Interactive Component Selection**

   Alternatively, run the `add` command without specifying a component. This will present a list of available components to select and install interactively:

   ```bash
   npx shadcn@latest add
   ```

   Follow the prompts to choose the components you want to add.

   ![shadcn components selection](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/b1wu9n78vqdcfdvwqc34.png)

These commands will create the respective component files in your `components/ui` directory. You can then import and use them throughout your project.

---

## Building a User-Friendly Home Page

Now, let's craft a **user-friendly interface** where users can search for Amazon products effortlessly.

### Home Page Component (`app/page.jsx`)

Replace the content of `app/page.jsx` with the following code:

```javascript
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
            <Card
              key={i}
              className="flex flex-col h-full rounded-xl shadow-2xl"
            >
              {product.image && product.image !== "N/A" ? (
                <CardContent className="relative h-64 bg-white rounded-t-xl">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    style={{ objectFit: "contain" }}
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
          {`No results found for "${query}"`}
        </div>
      )}
    </main>
  );
}
```

![Home screen](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/34zqzmjtbxe0b3hfruhc.png)

### What's Happening Here

- **State Management:** We're using `useState` to handle loading states, the user's query input, fetched products, and any potential errors.
- **Form Handling:** The `onSubmit` function sends a request to our backend API with the search query.
- **Fetching Data:** It fetches data from `/api/searchprod` and updates the UI based on the response.
- **Displaying Results:** Products are displayed in a responsive grid with images, titles, prices, stars, and reviews, all styled using shadcn UI components.

---

## Identifying the Information to Retrieve on the Amazon Product Page

To effectively scrape data from Amazon, we need to know **what** and **where** to extract. Here's how we approach it:

We'll use the [Amazon listing results](https://www.amazon.in/s?k=macbook+pro&ref=nb_sb_noss) for the “MacBook Pro” search term to retrieve details like the product title and price.

### Step 1: Navigate to Amazon and Perform a Search

Head over to Amazon and search for "MacBook Pro." To inspect the page and understand the DOM structure, follow the instructions based on your operating system:

- **For Windows/Linux Users:**
  - **Right-Click Method:** Right-click anywhere on the page and select **"Inspect"** from the context menu.
  - **Keyboard Shortcut:** Press `Ctrl + Shift + I` to open the Developer Tools directly.

- **For Mac Users:**
  - **Right-Click Method:** Right-click (or `Control + Click`) anywhere on the page and select **"Inspect"** from the context menu.
  - **Keyboard Shortcut:** Press `Option + Command + I` to open the Developer Tools directly.


![Amazon search](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/lye0xopmr0brgjvxban8.png)

### Step 2: Matching Information with DOM Selectors

Here's a table outlining the selectors we'll use:

| **Information**    | **DOM Selector**                  | **Description**                                             |
|--------------------|-----------------------------------|-------------------------------------------------------------|
| Product Title      | `h2 a span`                       | Retrieves the text for the product title from search results.|
| Price (Whole)      | `.a-price-whole`                  | Extracts the whole part of the product's price.             |
| Price (Fraction)   | `.a-price-fraction`               | Extracts the fractional part of the product's price.        |
| Reviews Count      | `.a-size-base.s-underline-text`   | Retrieves the number of reviews for the product.            |
| Star Rating        | `.a-icon-alt`                     | Retrieves the star rating of the product.                   |
| Product Image      | `.s-image`                        | Extracts the product image URL from the search results.     |


---

## Creating the API Route

Now, let's set up the backend that handles **web scraping** using **Puppeteer** and **Cheerio**.

### API Route (`app/api/searchprod/route.js`)

Create a new file at `app/api/searchprod/route.js` and add the following code:

```javascript
// app/api/searchprod/route.js
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import * as cheerio from "cheerio";

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({
      error: "No query provided",
      status: 400,
      success: false,
    });
  }

  const amazon = "https://www.amazon.in/";

  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set a user agent to mimic a real browser and avoid blocking
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/85.0.4183.102 Safari/537.36"
    );

    await page.goto(amazon, { waitUntil: "networkidle2" });

    // Type the query into the search box and press Enter
    await page.type("#twotabsearchtextbox", query);
    await Promise.all([
      page.keyboard.press("Enter"),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    const html = await page.content();
    const $ = cheerio.load(html);

    const products = [];

    // Loop through each product item
    $(".s-main-slot .s-result-item").each((_, element) => {
      const title = $(element).find("h2 a span").text().trim();

      const priceWhole = $(element)
        .find(".a-price-whole")
        .first()
        .text()
        .trim();
      const priceFraction = $(element)
        .find(".a-price-fraction")
        .first()
        .text()
        .trim();
      const price = priceWhole
        ? `₹${priceWhole}.${priceFraction || "00"}`
        : "N/A";

      const reviews = $(element)
        .find(".a-size-base.s-underline-text")
        .text()
        .trim();

      const stars = $(element).find(".a-icon-alt").text().trim();

      const image = $(element).find(".s-image").attr("src");

      if (title) {
        products.push({
          title,
          price,
          reviews: reviews || "N/A",
          stars: stars || "N/A",
          image: image || "N/A",
        });
      }
    });

    if (products.length === 0) {
      return NextResponse.json({
        error: "No products found",
        status: 404,
        success: false,
      });
    }

    return NextResponse.json({ products, success: true, status: 200 });
  } catch (error) {
    return NextResponse.json({
      error: "Something went wrong",
      status: 500,
      success: false,
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
```

### Breaking It Down

**Imports:**
- **NextResponse:** For sending JSON responses.
- **Puppeteer:** Automates browser actions.
- **Cheerio:** Parses and manipulates HTML.

**Handling the GET Request:**

- **Extract Query Parameter:** Retrieves the `query` parameter from the URL.
- **Validation:** Returns an error response if no query is provided.

**Launching Puppeteer:**

- **Headless Mode:** Runs the browser in headless mode for efficiency.
- **User Agent:** Sets a realistic user agent string to mimic a real browser and avoid detection/blocking.

**Navigating to Amazon and Performing the Search:**

- **Navigate to Amazon:** Opens Amazon India's homepage and waits until the network is idle.
- **Perform Search:** Types the search query into Amazon's search box and submits the form.

**Scraping the Data:**

- **Get Page Content:** Retrieves the HTML content of the search results page.
- **Load into Cheerio:** Parses the HTML for data extraction.
- **Extract Product Details:** Gathers information such as title, price, reviews, stars, and image for each product.

**Sending the Response:**
- **Success:** If products are found, sends them back as a JSON response.
- **No Products Found:** Returns a 404 error if no products match the search query.
- **Error Handling:** Catches any unexpected errors and sends a 500 error response.

---

## Integrating Frontend with Backend API

With both frontend and backend set up, here's how they interact:

1. **User Input:** The user types a product name into the search bar and hits "Search."
2. **API Call:** The `onSubmit` function sends a GET request to `/api/searchprod` with the search query.
3. **Scraping:** The API route uses Puppeteer to navigate Amazon, perform the search, and scrape the results using Cheerio.
4. **Displaying Results:** The scraped data is sent back to the frontend, which then displays the products in a neat grid.

![Home Screen GIF](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/soroq3t4jdlyodp7gv8u.gif)

---

## Polishing the Application with Final Touches

### `package.json` Configuration

Ensure your `package.json` includes the necessary dependencies:

```json
{
  "name": "amazon-product-search",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@radix-ui/react-icons": "^1.3.0",
    "@radix-ui/react-slot": "^1.1.0",
    "cheerio": "^1.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.446.0",
    "next": "14.2.13",
    "puppeteer": "^23.4.1",
    "react": "^18",
    "react-dom": "^18",
    "tailwind-merge": "^2.5.2",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "eslint": "^8",
    "eslint-config-next": "14.2.13",
    "postcss": "^8",
    "tailwindcss": "^3.4.1"
  }
}
```

### Best Practices

- **Respectful Scraping:** Always check the target site's `robots.txt` and terms of service to ensure you're allowed to scrape their data.
- **Error Handling:** Implement robust error handling to manage unexpected issues gracefully.
- **Performance Optimization:** Puppeteer can be resource-intensive. Consider using caching or limiting scraping frequency to optimize performance.
- **Security:** Validate and sanitize all inputs to protect against potential vulnerabilities.

---

## Wrapping Up and Conclusion

And there you have it—a fully functional **Amazon Product Search app** built with **Next.js 14**, **Puppeteer**, **Cheerio**, and **shadcn UI**! 🎉 Whether you're aiming to enhance your web scraping skills or build data-driven applications, these tools provide incredible flexibility and power.

### What's Next?

- **Enhance the UI:** Add more styling or animations to make your app even more user-friendly.
- **Add More Features:** Implement pagination, filters, or sorting to refine your search results.
- **Deploy Your App:** Share your creation with the world by deploying it on platforms like Vercel or Heroku.

---

Happy coding, and I hope this guide assists you on your development journey! 🚀

## Helpful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Puppeteer GitHub Repository](https://github.com/puppeteer/puppeteer)
- [Cheerio Documentation](https://cheerio.js.org/)
- [shadcn UI Documentation](https://ui.shadcn.com/)