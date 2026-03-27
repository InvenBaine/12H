const SHEET_ID = '1VIvLvBigv9mbnPtGzFJP1R7O0YKB-VTCo4OOWZw8Evc';

async function getStockData() {
    const content = document.getElementById('ticker-content');
    if (!content) return;

    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

    try {
        const res = await fetch(url);
        const text = await res.text();
        const json = JSON.parse(text.substring(47).slice(0, -2));
        const rows = json.table.rows;

        let htmlContent = "";

        rows.forEach((row) => {
            const name = row.c[0]?.v;   // A열: 지수명
            const price = row.c[1]?.v;  // B열: 가격 (시트에서 만든 단위 포함)
            const change = row.c[2]?.v; // C열: 대비
            const pct = row.c[3]?.v;    // D열: 등락률

            if (!name || price === null) return;

            const isUp = change >= 0;
            const colorClass = isUp ? "up" : "down";
            const sign = isUp ? "▲" : "▼";
            const formattedPct = (pct * 100).toFixed(2);

            htmlContent += `
                <span class="item">
                    <span class="label">${name}</span>
                    <span class="${colorClass}">
                        ${price} ${sign}${Math.abs(change).toFixed(2)} 
                        <span class="percent">(${formattedPct}%)</span>
                    </span>
                </span>`;
        });

        if(htmlContent) {
            content.innerHTML = htmlContent + htmlContent;
        }
    } catch (e) {
        console.error("데이터 로드 실패:", e);
    }
}

function updateMarketInfo() {
    const now = new Date();
    const kst = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (9 * 3600000));
    const timeStr = kst.toLocaleTimeString('ko-KR', { hour12: false });
    const timeEl = document.getElementById('current-time');
    if(timeEl) timeEl.innerHTML = timeStr;
}

updateMarketInfo();
setInterval(updateMarketInfo, 1000);
getStockData();
setInterval(getStockData, 30000); // 방송 중 실시간성을 위해 30초 주기로 설정
