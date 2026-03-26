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
            const proxyUrl = 'https://api.allorigins.win/get?url=';
            const targetUrl = encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
            
            const res = await fetch(proxyUrl + targetUrl);
            const json = await res.json();
            const data = JSON.parse(json.contents);
            
            if (data.chart.result) {
                const quote = data.chart.result[0].meta;
                const price = quote.regularMarketPrice.toFixed(2);
                const prevPrice = quote.previousClose;
                
                const change = (price - prevPrice).toFixed(2);
                const percent = ((change / prevPrice) * 100).toFixed(2); // 등락률 계산
                
                const colorClass = change >= 0 ? "up" : "down";
                const sign = change >= 0 ? "▲" : "▼";

                items.push(`
                    <span class="item">
                        ${name} 
                        <span class="${colorClass}">
                            ${price} ${sign}${Math.abs(change)} 
                            <span class="percent">(${percent}%)</span>
                        </span>
                    </span>
                `);
            }
        } catch (e) {
            console.error(`${name} 로드 실패`);
        }
    }
    
    if(items.length > 0) {
        const combined = items.join("");
        content.innerHTML = combined + combined;
    }
}

getStockData();
setInterval(getStockData, 60000);
