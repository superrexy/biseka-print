import chromium from "@sparticuz/chromium";
import { Hono } from "hono";
import { stream } from "hono/streaming";
import { handle } from "hono/vercel";
import puppeteerCore from "puppeteer-core";

const app = new Hono().basePath("/api");

app.get("/", (c) => {
  return c.json({ message: "Congrats! You've deployed Hono to Vercel" });
});

app.get("/print", (c) => {
  return stream(c, async (stream) => {
    let browser;
    if (process.env.VERCEL_ENV === "production") {
      browser = await puppeteerCore.launch({
        args: chromium.args,
        headless: chromium.headless,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
      });
    } else {
      browser = await puppeteerCore.launch({
        executablePath:
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        headless: "shell",
        defaultViewport: {
          width: 1920,
          height: 1080,
        },
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }

    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on("request", (request) => {
      var data = {
        method: "POST",
        postData:
          "owner=Deleniti+quia+ut+ad+&project=Esse+voluptatem+Mai&location=Aut+laborum+Incidid&year=1991&work_type%5B%5D=Voluptatibus+tempora&value%5B%5D=27&month1=8&min1_1%5B%5D=8&min2_1%5B%5D=72&min3_1%5B%5D=80&min4_1%5B%5D=75&min5_1%5B%5D=2&month2=5&min1_2%5B%5D=15&min2_2%5B%5D=36&min3_2%5B%5D=13&min4_2%5B%5D=88&min5_2%5B%5D=23",
        headers: {
          ...request.headers(),
          "content-type": "application/x-www-form-urlencoded",
        },
      };

      request.continue(data);
    });

    const url = "https://app.bisekas.com/draft-scehdule/download";
    const response = await page.goto(url);

    await page.evaluate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    });

    // Take a print of the page
    const pdf = await page.pdf({ format: "A4", landscape: true });
    // const screenshot = await page.screenshot({ fullPage: true });
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
