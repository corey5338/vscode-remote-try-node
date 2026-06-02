import { useEffect, useState } from "react";

type Stock = {
  ticker: string;
  rules: string[];
  limitPrice: string;
  signalCount: number;
};

type RecommendationData = {
  dataDate: string;
  generatedAt: string;
  stockCount: number;
  stocks: Stock[];
};

function App() {
  const [data, setData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const response = await fetch(
        `/data/recommendations.json?${Date.now()}`
      );

      const json = await response.json();

      json.stocks.sort(
        (a: Stock, b: Stock) =>
          b.signalCount - a.signalCount
      );

      setData(json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function isToday(dateString: string) {
    const today = new Date();

    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");

    const todayString = `${y}/${m}/${d}`;

    return dateString === todayString;
  }

  function signalStars(count: number) {
    if (count >= 3) return "★★★";
    if (count === 2) return "★★";
    return "★";
  }

  if (loading) {
    return (
      <div
        style={{
          background: "#111827",
          color: "white",
          minHeight: "100vh",
          padding: "20px",
        }}
      >
        読み込み中...
      </div>
    );
  }

  if (!data) {
    return (
      <div
        style={{
          background: "#111827",
          color: "white",
          minHeight: "100vh",
          padding: "20px",
        }}
      >
        データ取得失敗
      </div>
    );
  }

  const todayData = isToday(data.dataDate);

  return (
    <div
      style={{
        background: "#111827",
        minHeight: "100vh",
        color: "white",
        padding: "16px",
        fontFamily: "sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          marginBottom: "12px",
        }}
      >
        本日の推奨銘柄
      </h1>

      <div
        style={{
          background: todayData
            ? "#14532d"
            : "#7f1d1d",
          padding: "12px",
          borderRadius: "10px",
          marginBottom: "16px",
          fontWeight: "bold",
        }}
      >
        {todayData
          ? `🟢 本日のデータ (${data.dataDate})`
          : `🔴 古いデータ (${data.dataDate})`}
      </div>

      <div
        style={{
          marginBottom: "20px",
          color: "#d1d5db",
        }}
      >
        推奨銘柄数: {data.stockCount}
      </div>

      {data.stocks.map((stock) => (
        <div
          key={stock.ticker}
          style={{
            background: "#1f2937",
            borderRadius: "14px",
            padding: "16px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: "#fbbf24",
              marginBottom: "4px",
            }}
          >
            {signalStars(stock.signalCount)}
          </div>

          <div
            style={{
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            {stock.ticker}
          </div>

          <div
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "#4ade80",
              marginTop: "8px",
            }}
          >
            ${stock.limitPrice}
          </div>

          <div
            style={{
              marginTop: "10px",
              color: "#9ca3af",
            }}
          >
            {stock.rules.join(" / ")}
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;