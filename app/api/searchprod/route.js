import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium";

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

    if (process.env.AWS_REGION || process.env.VERCEL) {
      // Running on Vercel (production environment)
      puppeteerInstance = puppeteerCore;

      browserOptions = {
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      };
    } else {
      // Running locally (development environment)
      puppeteerInstance = puppeteer;

      browserOptions = {
        headless: "new",
      };
    }

    browser = await puppeteerInstance.launch(browserOptions);

    const page = await browser.newPage();

    // Set a user agent to prevent potential blocking
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
