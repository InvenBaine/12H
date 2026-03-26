const symbols = {
    "KOSPI": "^KS11",
    "KOSDAQ": "^KQ11",
    "S&P500": "^GSPC",
    "US10Y": "^TNX",
    "WTI Oil": "CL=F"
};

async function getStockData() {
    const content = document.getElementById('ticker-content');
    if (!content) return;
    
    let items = [];

    for (const [name, symbol] of Object.entries(symbols)) {
        try {
            // CORS 차단을 피하기 위해 프록시 서버를 경유합니다.
            const proxyUrl = 'https://api.allorigins.win/get?url=';
            const targetUrl = encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
            
            const res = await fetch(proxyUrl + targetUrl);
            const json = await res.json();
            const data = JSON.parse(json.contents);
            
            const quote = data.chart.result[0].meta;
            const price = quote.regularMarketPrice.toFixed(2);
            const prevPrice = quote.previousClose;
            const change = (price - prevPrice).toFixed(2);
            const colorClass = change >= 0 ? "up" : "down";
            const sign = change >= 0 ? "▲" : "▼";

            items.push(`${name} <span class="${colorClass}">${price} (${sign}${Math.abs(change)})</span>`);
        } catch (e) {
            console.error(`${name} 로드 실패`);
        }
    }
    
    if(items.length > 0) {
        // 이전 버전처럼 깔끔하게 한 줄로 출력 (간격 유지)
        const combined = items.join("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
        content.innerHTML = combined + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + combined; 
    }
}

getStockData();
setInterval(getStockData, 60000); // 1분마다 자동 갱신
