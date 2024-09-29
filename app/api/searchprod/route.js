import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer";

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
    let browserOptions = {};

    let puppeteerInstance;

    if (process.env.VERCEL) {
      puppeteerInstance = puppeteerCore;

      browserOptions = {
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        defaultViewport: chromium.defaultViewport,
        ignoreHTTPSErrors: true,
      };
    } else {
      // Development environment (Local)
      // const puppeteerModule = await import("puppeteer");
      puppeteerInstance = puppeteer;

      browserOptions = {
        headless: true,
        defaultViewport: null,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      };
    }

    browser = await puppeteerInstance.launch(browserOptions);
    const page = await browser.newPage();

    // Block unnecessary resources to save memory and speed up scraping
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (["image", "stylesheet", "font"].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Set User-Agent to mimic a real browser
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/85.0.4183.102 Safari/537.36"
    );

    await page.goto(amazon, { waitUntil: "networkidle2" });
    await page.type("#twotabsearchtextbox", query);
    await Promise.all([
      page.keyboard.press("Enter"),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    const html = await page.content();
    const $ = cheerio.load(html);

    const products = [];

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
      let price = priceWhole
        ? `₹${priceWhole}${priceFraction ? `.${priceFraction}` : ".00"}`
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

    return NextResponse.json(
      { products, success: true, status: 200 },
      { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate" } }
    );
  } catch (error) {
    console.error("Error during scraping:", error);
    return NextResponse.json({
      error: error.message || "Something went wrong",
      status: 500,
      success: false,
    });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }
    }
  }
}
