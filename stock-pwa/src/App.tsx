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

export default function App() {
  const [data, setData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  async function loadRecommendations() {
    try {
      const response = await fetch(
        "/data/recommendations.json?t=" + Date.now()
      );

      const json = await response.json();

      setData(json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function isToday(dateString: string) {
    if (!dateString) return false;

    const today = new Date();

    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const todayString = `${yyyy}/${mm}/${dd}`;

    return dateString === todayString;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#111827",
        color: "white",
        padding: "16px",
        fontFamily: "sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "30px",
          fontWeight: "bold",
          marginBottom: "20px",
        }}
      >
        📈 本日の推奨銘柄
      </h1>

      {loading && <p>読み込み中...</p>}

      {!loading && data && (
        <>
          <div
            style={{
              background: "#1f2937",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "20px",
            }}
          >
            <div style={{ marginBottom: "8px" }}>
              <strong>データ日付:</strong>
              <br />
              {data.dataDate}
            </div>

            <div style={{ marginBottom: "8px" }}>
              <strong>銘柄数:</strong>
              <br />
              {data.stockCount}
            </div>

            <div>
              <strong>状態:</strong>
              <br />
              {isToday(data.dataDate)
                ? "🟢 本日のデータ"
                : "🔴 本日のCSV未更新"}
            </div>
          </div>

          {data.stocks.map((stock) => (
            <div
              key={stock.ticker}
              style={{
                background: "#1f2937",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              >
                {stock.signalCount >= 3
                  ? "⭐⭐⭐ "
                  : stock.signalCount === 2
                  ? "⭐⭐ "
                  : "⭐ "}
                {stock.ticker}
              </div>

              <div
                style={{
                  marginTop: "10px",
                  color: "#d1d5db",
                }}
              >
                シグナル数: {stock.signalCount}
              </div>

              <div
                style={{
                  marginTop: "10px",
                }}
              >
                {stock.rules.map((rule) => (
                  <div key={rule}>・{rule}</div>
                ))}
              </div>

              <div
                style={{
                  marginTop: "12px",
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#34d399",
                }}
              >
                指値: {stock.limitPrice}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}