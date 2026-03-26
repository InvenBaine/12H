const symbols = {
    "코스피": "^KS11",
    "코스닥": "^KQ11",
    "S&P500": "^GSPC",
    "미국 10년물": "^TNX",
    "WTI 유가": "CL=F"
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
                const price = quote.regularMarketPrice.toLocaleString(undefined, {minimumFractionDigits: 2});
                const prevPrice = quote.previousClose;
                
                const changeValue = (quote.regularMarketPrice - prevPrice);
                const percent = ((changeValue / prevPrice) * 100).toFixed(2);
                
                const colorClass = changeValue >= 0 ? "up" : "down";
                const sign = changeValue >= 0 ? "▲" : "▼";

                items.push(`
                    <span class="item">
                        ${name} 
                        <span class="${colorClass}">
                            ${price} ${sign}${Math.abs(changeValue).toFixed(2)} 
                            <span class="percent">${percent}%</span>
                        </span>
                    </span>
                `);
            }
        } catch (e) {
            console.error(`${name} 로딩 에러`);
        }
    }
    
    if(items.length > 0) {
        const combined = items.join("");
        content.innerHTML = combined + combined; // 무한 반복
    }
}

// 1분 간격 자동 업데이트
getStockData();
setInterval(getStockData, 60000);
