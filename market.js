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
            const targetUrl = encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`);
            
            const res = await fetch(proxyUrl + targetUrl);
            const json = await res.json();
            const data = JSON.parse(json.contents);
            
            if (data.chart && data.chart.result && data.chart.result[0]) {
                const result = data.chart.result[0];
                const meta = result.meta;
                
                // 지수 가격 정보 가져오기 (현재가 또는 마지막 종가)
                const price = meta.regularMarketPrice;
                const prevPrice = meta.previousClose;
                
                if (price && prevPrice) {
                    const changeValue = (price - prevPrice);
                    const percent = ((changeValue / prevPrice) * 100).toFixed(2);
                    
                    const colorClass = changeValue >= 0 ? "up" : "down";
                    const sign = changeValue >= 0 ? "▲" : "▼";
                    
                    // 지수 특성에 따라 소수점 자리수 조정
                    const displayPrice = price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });

                    items.push(`
                        <span class="item">
                            ${name} 
                            <span class="${colorClass}">
                                ${displayPrice} ${sign}${Math.abs(changeValue).toFixed(2)} 
                                <span class="percent">${percent}%</span>
                            </span>
                        </span>
                    `);
                }
            }
        } catch (e) {
            console.error(`${name} (${symbol}) 로딩 에러:`, e);
        }
    }
    
    if(items.length > 0) {
        // 무한 반복을 위해 데이터를 합칩니다.
        const combined = items.join("");
        content.innerHTML = combined + combined;
    }
}

// 1분 간격 자동 업데이트 (장중 실시간 대응)
getStockData();
setInterval(getStockData, 60000);
