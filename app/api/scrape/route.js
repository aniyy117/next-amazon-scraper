// app/api/scrape/route.js
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET(request) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://example.com", { waitUntil: "networkidle2" });
    const title = await page.title();
    await browser.close();
    return NextResponse.json({ title, success: true, status: 200 });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to scrape the page.",
      success: false,
      status: 500,
    });
  }
}
