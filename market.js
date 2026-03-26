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
            // 캐시 방지를 위해 요청 주소 뒤에 랜덤 타임스탬프를 붙입니다.
            const proxyUrl = 'https://api.allorigins.win/get?url=';
            const targetUrl = encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d&_=${Date.now()}`);
            
            const res = await fetch(proxyUrl + targetUrl);
            const json = await res.json();
            const data = JSON.parse(json.contents);
            
            if (data.chart && data.chart.result && data.chart.result[0]) {
                const result = data.chart.result[0];
                const meta = result.meta;
                
                const price = meta.regularMarketPrice;
                const prevPrice = meta.previousClose;
                
                if (price && prevPrice) {
                    const changeValue = (price - prevPrice);
                    const percent = ((changeValue / prevPrice) * 100).toFixed(2);
                    
                    const colorClass = changeValue >= 0 ? "up" : "down";
                    const sign = changeValue >= 0 ? "▲" : "▼";
                    
                    const displayPrice = price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });

                    items.push(`
                        <span class="item">
                            ${name} 
                            <span class="${colorClass}">
                                ${price.toFixed(2)} ${sign}${Math.abs(changeValue).toFixed(2)} 
                                <span class="percent">(${percent}%)</span>
                            </span>
                        </span>
                    `);
                }
            }
        } catch (e) {
            console.error(`${name} 업데이트 실패`);
        }
    }
    
    if(items.length > 0) {
        const combined = items.join("");
        // 기존 내용과 비교하여 변경사항이 있을 때만 갱신 (화면 깜빡임 방지)
        if (content.innerHTML !== combined + combined) {
            content.innerHTML = combined + combined;
        }
    }
}

// 1. 최초 즉시 실행
getStockData();

// 2. 갱신 주기: 10초 (가장 안전하면서도 빠른 주기)
// 만약 더 빠르게 하고 싶다면 5000(5초)까지는 괜찮으나, 
// 야후 API 특성상 1분 단위 데이터가 최선인 경우가 많습니다.
setInterval(getStockData, 10000);
