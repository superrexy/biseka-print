import chromium from "@sparticuz/chromium";
import { Hono } from "hono";
import { stream } from "hono/streaming";
import { handle } from "hono/vercel";
import puppeteerCore from "puppeteer-core";

export const config = {
  maxDuration: 150,
};

const app = new Hono().basePath("/api");

app.get("/", (c) => {
  return c.json({ message: "Congrats! You've deployed Hono to Vercel" });
});

app.post("/draft-schedule/print", (c) => {
  return stream(c, async (stream) => {
    chromium.setHeadlessMode = true;
    chromium.setGraphicsMode = false;

    const chromeArgs = [
      '--font-render-hinting=none', // Improves font-rendering quality and spacing
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-animations',
      '--disable-background-timer-throttling',
      '--disable-restore-session-state',
      '--disable-web-security', // Only if necessary, be cautious with security implications
      '--single-process', // Be cautious as this can affect stability in some environments
    ];
    
    let browser;
    browser = await puppeteerCore.launch({
      args: chromeArgs,
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.setRequestInterception(true);

    // Validate Request
    const errors = [];

    const body = await c.req.json();

    if (!body.owner) errors.push({ owner: "Owner is required" });
    if (!body.project) errors.push({ project: "Project is required" });
    if (!body.location) errors.push({ location: "Location is required" });
    if (!body.year) errors.push({ year: "Year is required" });
    if (!body.min_1_1) errors.push({ min_1_1: "Min 1.1 is required" });
    if (!body.min_2_1) errors.push({ min_2_1: "Min 2.1 is required" });
    if (!body.min_3_1) errors.push({ min_3_1: "Min 3.1 is required" });
    if (!body.min_4_1) errors.push({ min_4_1: "Min 4.1 is required" });
    if (!body.min_5_1) errors.push({ min_5_1: "Min 5.1 is required" });
    if (!body.min_1_2) errors.push({ min_1_2: "Min 1.2 is required" });
    if (!body.min_2_2) errors.push({ min_2_2: "Min 2.2 is required" });
    if (!body.min_3_2) errors.push({ min_3_2: "Min 3.2 is required" });
    if (!body.min_4_2) errors.push({ min_4_2: "Min 4.2 is required" });
    if (!body.min_5_2) errors.push({ min_5_2: "Min 5.2 is required" });
    if (!body.month1) errors.push({ month1: "Month 1 is required" });
    if (!body.month2) errors.push({ month2: "Month 2 is required" });
    if (!body.value) errors.push({ value: "Value is required" });
    if (!body.work_type) errors.push({ work_type: "Work Type is required" });

    const formData = new URLSearchParams();
    for (const key in body) {
      if (Array.isArray(body[key])) {
        body[key].forEach((value) => {
          formData.append(`${key}[]`, value);
        });
      } else {
        formData.append(key, body[key]);
      }
    }


    if (errors.length > 0) {
      return c.json({ errors }, 400);
    }

    const queryString = new URLSearchParams(formData).toString();
    console.log(queryString);

    page.on("request", (request) => {
      var data = {
        method: "POST",
        postData: queryString,
        headers: {
          ...request.headers(),
          "content-type": "application/x-www-form-urlencoded",
        },
      };

      request.continue(data);
    });

    const url = "https://app.bisekas.com/draft-scehdule/download";
      
    await page.emulateMediaType('print')
      
    await page.goto(url, { waitUntil: "domcontentloaded" });

    await page.evaluate(async () => {
      // Remove Cetak Button
      const button = document.querySelector(".cetak-button");
      button.remove();

      // Wait Until 1 Seconds
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    // Add Padding Print
    await page.addStyleTag({
      content: `
        @page {
          size: A4 landscape;
          margin: 0.2in;
        }
        body {
          margin: 0;
        }
      `,
    });

    const pdf = await page.pdf({
      format: "A4",
      landscape: true,
      preferCSSPageSize: true,
    });
    await browser.close();

    stream.onAbort(() => {
      console.log("Stream aborted");
    });

    await stream.write(pdf);
  });
});

const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const OPTIONS = handler;
