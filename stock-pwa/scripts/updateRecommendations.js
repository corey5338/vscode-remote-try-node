import fs from "fs";

const URLS = {
  shortTerm:
    "https://www.dropbox.com/scl/fi/ravm1ck094mcwokkkb1a3/_.csv?rlkey=b37r378xwfmggufa4568uxkfe&st=8jqmm74w&raw=1",
  sector:
    "https://www.dropbox.com/scl/fi/0a6tfn8y4xb3vm4mj5e68/RS.csv?rlkey=p80y2xk41wpesg7gf532nc4ec&st=d0kt1y3e&raw=1",
  dow:
    "https://www.dropbox.com/scl/fi/z3bx0wdw89bm3z8r60vbh/.csv?rlkey=eu79u1mae2ob6kar6co0fui55&st=9h0z5t2d&raw=1",
  master:
    "https://www.dropbox.com/scl/fi/ghcvp1eqb2wobp0wp1cgt/.csv?rlkey=kruba9xj3s9nep1ydr79x5qbw&st=zuu81r3z&raw=1",
};

function parseCSV(text) {
  const lines = text.trim().split("\n");

  const headers = lines[0]
    .replace(/\r/g, "")
    .split(",");

  return lines.slice(1).map((line) => {
    const values = line.replace(/\r/g, "").split(",");

    const obj = {};

    headers.forEach((h, i) => {
      obj[h.trim()] = values[i]?.trim() ?? "";
    });

    return obj;
  });
}

async function loadCsv(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`CSV取得失敗: ${url}`);
  }

  return parseCSV(await response.text());
}

async function main() {
  const shortRows = await loadCsv(URLS.shortTerm);
  const sectorRows = await loadCsv(URLS.sector);
  const dowRows = await loadCsv(URLS.dow);
  const masterRows = await loadCsv(URLS.master);

  const dataDate =
    shortRows[0]?.["日付"] ||
    sectorRows[0]?.["日付"] ||
    dowRows[0]?.["日付"] ||
    "";

  const masterMap = new Map();

  masterRows.forEach((row) => {
    masterMap.set(row["ティッカー"], row);
  });

  const merged = new Map();

  function addSignal(ticker, rule, limitPrice) {
    if (!ticker) return;

    if (!merged.has(ticker)) {
      merged.set(ticker, {
        ticker,
        rules: [],
        limitPrice,
      });
    }

    merged.get(ticker).rules.push(rule);
  }

  shortRows.forEach((row) => {
    const ticker = row["ティッカー"];

    const data = masterMap.get(ticker);

    if (!data) return;

    addSignal(
      ticker,
      "短期逆張り",
      data["前日安値-ATR0.5"]
    );
  });

  sectorRows.forEach((row) => {
    const ticker = row["ティッカー"];

    const data = masterMap.get(ticker);

    if (!data) return;

    addSignal(
      ticker,
      "セクター別RS",
      data["前日安値-ATR0.5"]
    );
  });

  dowRows.forEach((row) => {
    const ticker = row["ティッカー"];

    addSignal(
      ticker,
      "ダウ理論",
      row["ダウ理論ライン+1ティック"]
    );
  });

  const stocks = Array.from(merged.values())
    .map((item) => ({
      ...item,
      signalCount: item.rules.length,
    }))
    .sort((a, b) => b.signalCount - a.signalCount);

  const output = {
    dataDate,
    generatedAt: new Date().toISOString(),
    stockCount: stocks.length,
    stocks,
  };

  fs.mkdirSync("public/data", { recursive: true });

  fs.writeFileSync(
    "public/data/recommendations.json",
    JSON.stringify(output, null, 2)
  );

  console.log(
    `${stocks.length}銘柄生成 (${dataDate})`
  );
}

main().catch(console.error);