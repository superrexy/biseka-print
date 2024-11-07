import chromium from "@sparticuz/chromium";
import { Hono } from "hono";
import { stream } from "hono/streaming";
import { handle } from "hono/vercel";
import puppeteerCore from "puppeteer-core";

const app = new Hono().basePath("/api");

app.get("/", (c) => {
  return c.json({ message: "Congrats! You've deployed Hono to Vercel" });
});

app.post("/draft-schedule/print", (c) => {
  return stream(c, async (stream) => {
    let browser;
    browser = await puppeteerCore.launch({
      args: chromium.args,
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
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

    const formData = new FormData();
    formData.append("owner", body.owner);
    formData.append("project", body.project);
    formData.append("location", body.location);
    formData.append("year", body.year);

    if (body.min_1_1) {
      for (let i = 0; i < body.min_1_1.length; i++) {
        formData.append("min1_1[]", body.min_1_1[i]);
      }
    }

    if (body.min_2_1) {
      for (let i = 0; i < body.min_2_1.length; i++) {
        formData.append("min2_1[]", body.min_2_1[i]);
      }
    }

    if (body.min_3_1) {
      for (let i = 0; i < body.min_3_1.length; i++) {
        formData.append("min3_1[]", body.min_3_1[i]);
      }
    }

    if (body.min_4_1) {
      for (let i = 0; i < body.min_4_1.length; i++) {
        formData.append("min4_1[]", body.min_4_1[i]);
      }
    }

    if (body.min_5_1) {
      for (let i = 0; i < body.min_5_1.length; i++) {
        formData.append("min5_1[]", body.min_5_1[i]);
      }
    }

    if (body.min_1_2) {
      for (let i = 0; i < body.min_1_2.length; i++) {
        formData.append("min1_2[]", body.min_1_2[i]);
      }
    }

    if (body.min_2_2) {
      for (let i = 0; i < body.min_2_2.length; i++) {
        formData.append("min2_2[]", body.min_2_2[i]);
      }
    }

    if (body.min_3_2) {
      for (let i = 0; i < body.min_3_2.length; i++) {
        formData.append("min3_2[]", body.min_3_2[i]);
      }
    }

    if (body.min_4_2) {
      for (let i = 0; i < body.min_4_2.length; i++) {
        formData.append("min4_2[]", body.min_4_2[i]);
      }
    }

    if (body.min_5_2) {
      for (let i = 0; i < body.min_5_2.length; i++) {
        formData.append("min5_2[]", body.min_5_2[i]);
      }
    }

    if (body.month1) {
      for (let i = 0; i < body.month1.length; i++) {
        formData.append("month1", body.month1);
      }
    }

    if (body.month2) {
      for (let i = 0; i < body.month2.length; i++) {
        formData.append("month2", body.month2);
      }
    }

    if (body.value) {
      for (let i = 0; i < body.value.length; i++) {
        formData.append("value[]", body.value[i]);
      }
    }

    if (body.work_type) {
      for (let i = 0; i < body.work_type.length; i++) {
        formData.append("work_type[]", body.work_type[i]);
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
          margin: 0.4in;
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
