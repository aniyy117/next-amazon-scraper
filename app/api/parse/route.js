// app/api/parse/route.js
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import * as cheerio from "cheerio";

export async function GET(request) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://example.com", { waitUntil: "networkidle2" });
    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);
    const heading = $("h1").text().trim();

    return NextResponse.json({ heading, success: true, status: 200 });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to parse the page.",
      success: false,
      status: 500,
    });
  }
}
