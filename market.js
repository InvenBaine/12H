const SERVICE_KEY = '1d1043efb7e415ec16b01e63c91431f9ef51e9fe28d3be82ef841228537ed315'; // 반드시 따옴표 안에 넣으세요!

const groups = {
    "🌎 해외": { "S&P500": "^GSPC", "나스닥": "^IXIC" },
    "🛢️ 에너지": { "WTI유가": "CL=F" },
    "💵 채권": { "미10년채": "^TNX" }
};

// 한국 시장 기준 상태 판별
function getMarketStatus() {
    const now = new Date();
    const kst = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (9 * 3600000));
    const day = kst.getDay();
    const timeVal = kst.getHours() * 100 + kst.getMinutes();

    if (day === 0 || day === 6) return "주말 휴장";
    if (timeVal >= 900 && timeVal <= 1530) return "장중";
    if (timeVal < 900) return "장 시작전";
    return "장 마감";
}

function updateClock() {
    const now = new Date();
    const kst = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (9 * 3600000));
    const timeStr = kst.toLocaleTimeString('ko-KR', { hour12: false });
    document.getElementById('current-time').innerText = `${timeStr} (${getMarketStatus()})`;
}

async function getStockData() {
    const content = document.getElementById('ticker-content');
    if (!content) return;
    
    let htmlContent = "";

    // 1. 국내 지수 (공공데이터포털 API 연동)
    try {
        htmlContent += `<span class="group-label">🇰🇷 국내</span>`;
        const krUrl = `https://apis.data.go.kr/1160100/service/GetIndexQuotationsService/getIndexQuotations?serviceKey=${SERVICE_KEY}&resultType=json&numOfRows=5&pageNo=1`;
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        
        const res = await fetch(proxyUrl + encodeURIComponent(krUrl));
        const json = await res.json();
        const data = JSON.parse(json.contents);
        const krItems = data.response.body.items.item;

        krItems.forEach(item => {
            if (item.idxNm === "코스피" || item.idxNm === "코스닥") {
                const price = parseFloat(item.clpr).toFixed(2);
                const change = parseFloat(item.vs).toFixed(2);
                const fltRt = parseFloat(item.fltRt).toFixed(2);
                const colorClass = change >= 0 ? "up" : "down";
                const sign = change >= 0 ? "▲" : "▼";

                htmlContent += `
                    <span class="item">
                        ${item.idxNm} 
                        <span class="${colorClass}">
                            ${price} ${sign}${Math.abs(change)} 
                            <span class="percent">(${fltRt}%)</span>
                        </span>
                    </span>`;
            }
        });
    } catch (e) {
        console.error("국내 지수 로드 실패:", e);
        // 실패 시 비상용으로 야후 데이터라도 시도하게 하려면 여기에 추가 로직 가능
    }

    // 2. 해외 및 기타 지수 (야후 파이낸스)
    for (const [groupName, symbols] of Object.entries(groups)) {
        htmlContent += `<span class="group-label">${groupName}</span>`;
        for (const [name, symbol] of Object.entries(symbols)) {
            try {
                const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d&_=${Date.now()}`;
                const proxyUrl = 'https://api.allorigins.win/get?url=';
                
                const res = await fetch(proxyUrl + encodeURIComponent(yahooUrl));
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
                        </span>`;
                }
            } catch (e) { console.error(name + " 로드 실패"); }
        }
    }
    
    if(htmlContent) {
        content.innerHTML = htmlContent + htmlContent;
    }
}

updateClock();
setInterval(updateClock, 1000);
getStockData();
setInterval(getStockData, 30000); // API 부하를 줄이기 위해 30초 권장
