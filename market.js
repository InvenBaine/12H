const groups = {
    "🇰🇷 국내": { "코스피": "^KS11", "코스닥": "^KQ11" },
    "🌎 해외": { "S&P500": "^GSPC", "나스닥": "^IXIC" },
    "🛢️ 에너지": { "WTI유가": "CL=F" },
    "💵 채권": { "미10년채": "^TNX" }
};

// 장 상태 확인 함수
function getMarketStatus() {
    const now = new Date();
    const day = now.getDay(); // 0(일) ~ 6(토)
    const hour = now.getHours();
    const min = now.getMinutes();
    const currentTime = hour * 100 + min;

    if (day === 0 || day === 6) return "주말 휴장";
    if (currentTime >= 900 && currentTime <= 1530) return "장중";
    if (currentTime < 900) return "장 시작전";
    return "장 마감";
}

// 시계 업데이트
function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ko-KR', { hour12: false });
    document.getElementById('current-time').innerText = `${timeStr} (${getMarketStatus()})`;
}

async function getStockData() {
    const content = document.getElementById('ticker-content');
    if (!content) return;
    
    let htmlContent = "";

    for (const [groupName, symbols] of Object.entries(groups)) {
        htmlContent += `<span class="group-label">${groupName}</span>`;
        
        for (const [name, symbol] of Object.entries(symbols)) {
            try {
                const proxyUrl = 'https://api.allorigins.win/get?url=';
                const targetUrl = encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d&_=${Date.now()}`);
                
                const res = await fetch(proxyUrl + targetUrl);
                const json = await res.json();
                const data = JSON.parse(json.contents);
                
                if (data.chart.result) {
                    const meta = data.chart.result[0].meta;
                    const price = meta.regularMarketPrice;
                    const prevPrice = meta.previousClose;
                    const change = (price - prevPrice);
                    const percent = ((change / prevPrice) * 100).toFixed(2);
                    
                    const colorClass = change >= 0 ? "up" : "down";
                    const sign = change >= 0 ? "▲" : "▼";

                    htmlContent += `
                        <span class="item">
                            ${name} 
                            <span class="${colorClass}">
                                ${price.toFixed(2)} ${sign}${Math.abs(change).toFixed(2)} 
                                <span class="percent">(${percent}%)</span>
                            </span>
                        </span>
                    `;
                }
            } catch (e) { console.error(name + " 로드 실패"); }
        }
    }
    
    if(htmlContent) {
        content.innerHTML = htmlContent + htmlContent;
    }
}

// 실행 로직
updateClock();
setInterval(updateClock, 1000); // 1초마다 시계 갱신
getStockData();
setInterval(getStockData, 15000); // 15초마다 지수 갱신
