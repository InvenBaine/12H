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
    
    let html = "";

    for (const [name, symbol] of Object.entries(symbols)) {
        try {
            // CORS 문제를 해결하기 위해 공개 프록시(allorigins)를 경유합니다.
            const proxyUrl = 'https://api.allorigins.win/get?url=';
            const targetUrl = encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
            
            const res = await fetch(proxyUrl + targetUrl);
            const json = await res.json();
            
            // 프록시 서버에서 받은 데이터 중 실제 금융 데이터(contents)만 파싱합니다.
            const data = JSON.parse(json.contents);
            const quote = data.chart.result[0].meta;
            
            const price = quote.regularMarketPrice.toFixed(2);
            const prevPrice = quote.previousClose;
            const change = (price - prevPrice).toFixed(2);
            const colorClass = change >= 0 ? "up" : "down";
            const sign = change >= 0 ? "▲" : "▼";

            html += `<span class="item">${name} <span class="${colorClass}">${price} (${sign}${Math.abs(change)})</span></span>`;
        } catch (e) {
            console.error(`${name} 데이터 로드 실패:`, e);
        }
    }
    
    // 데이터가 정상적으로 로드되었을 때만 화면을 갱신합니다.
    if(html) {
        content.innerHTML = html + " &nbsp;&nbsp;&nbsp;&nbsp; " + html; 
    }
}

// 초기 실행 및 1분 간격 업데이트
getStockData();
setInterval(getStockData, 60000);
