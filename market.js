const SERVICE_KEY = '1d1043efb7e415ec16b01e63c91431f9ef51e9fe28d3be82ef841228537ed315'; 

// 1. 야후에서 가져올 해외 지표 설정
const overseasGroups = {
    "🌎 해외": { "S&P500": "^GSPC", "나스닥": "^IXIC" },
    "🛢️ 지표": { "WTI유가": "CL=F", "미10년채": "^TNX" }
};

// 2. 한국 시간 및 장 상태 판별 (KST 기준)
function updateMarketInfo() {
    const now = new Date();
    const kst = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (9 * 3600000));
    const day = kst.getDay();
    const timeVal = kst.getHours() * 100 + kst.getMinutes();

    let status = (day === 0 || day === 6) ? "주말 휴장" : 
                 (timeVal >= 900 && timeVal < 1530) ? "장중" : "장 마감";

    const timeStr = kst.toLocaleTimeString('ko-KR', { hour12: false });
    const statusEl = document.getElementById('market-status');
    const timeEl = document.getElementById('current-time');
    
    // index.html 구조에 맞춰 시계 업데이트
    if(timeEl) timeEl.innerHTML = `${timeStr} <span class="status-badge">${status}</span>`;
}

// 3. 지수 데이터 가져오기 메인 함수
async function getStockData() {
    const content = document.getElementById('ticker-content');
    if (!content) return;
    
    let htmlContent = "";
    // 현재 가장 안정적인 CORS 프록시 사용
    const proxyUrl = 'https://corsproxy.io/?';

    // --- [A] 국내 지수 (공공데이터 API) ---
    try {
        const krUrl = `https://apis.data.go.kr/1160100/service/GetIndexQuotationsService/getIndexQuotations?serviceKey=${SERVICE_KEY}&resultType=json&numOfRows=5&pageNo=1`;
        
        const res = await fetch(proxyUrl + encodeURIComponent(krUrl));
        const data = await res.json();
        
        // 공공데이터 API 응답 구조 파싱
        const krItems = data.response.body.items.item;

        htmlContent += `<span class="group-label">🇰🇷 국내</span>`;
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
                            ${price}<small>pt</small> ${sign}${Math.abs(change)} 
                            <span class="percent">(${fltRt}%)</span>
                        </span>
                    </span>`;
            }
        });
    } catch (e) {
        console.error("국내 지수 로드 실패:", e);
    }

    // --- [B] 해외 및 지표 (야후 파이낸스) ---
    for (const [groupName, symbols] of Object.entries(overseasGroups)) {
        htmlContent += `<span class="group-label">${groupName}</span>`;
        for (const [name, symbol] of Object.entries(symbols)) {
            try {
                const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d&_=${Date.now()}`;
                
                const res = await fetch(proxyUrl + encodeURIComponent(yahooUrl));
                const data = await res.json();
                
                if (data.chart && data.chart.result) {
                    const meta = data.chart.result[0].meta;
                    const price = meta.regularMarketPrice;
                    const prevPrice = meta.previousClose;
                    const change = (price - prevPrice);
                    const percent = ((change / prevPrice) * 100).toFixed(2);
                    const colorClass = change >= 0 ? "up" : "down";
                    const sign = change >= 0 ? "▲" : "▼";

                    let unit = "$"; 
                    if (name.includes("채권")) unit = "%";

                    htmlContent += `
                        <span class="item">
                            ${name} 
                            <span class="${colorClass}">
                                ${unit}${price.toFixed(2)} ${sign}${Math.abs(change).toFixed(2)} 
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

// 4. 실행 및 주기 설정
updateMarketInfo();
setInterval(updateMarketInfo, 1000);
getStockData();
setInterval(getStockData, 30000); // 30초마다 데이터 갱신
