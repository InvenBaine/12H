const SHEET_ID = '1VIvLvBigv9mbnPtGzFJP1R7O0YKB-VTCo4OOWZw8Evc';

// 1. 시간 및 장 상태 업데이트 (기존 톤앤매너 유지)
function updateMarketInfo() {
    const now = new Date();
    const kst = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (9 * 3600000));
    
    const timeStr = kst.toLocaleTimeString('ko-KR', { hour12: false });
    const day = kst.getDay();
    const timeVal = kst.getHours() * 100 + kst.getMinutes();

    let status = (day === 0 || day === 6) ? "주말 휴장" : 
                 (timeVal >= 900 && timeVal < 1530) ? "장중" : "장 마감";

    const timeEl = document.getElementById('current-time');
    if(timeEl) {
        timeEl.innerHTML = `${timeStr} <span class="status-badge">${status}</span>`;
    }
}

// 2. 구글 시트 데이터 로드 및 렌더링
async function getMarketData() {
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
            const priceWithUnit = row.c[1]?.v;  // B열: 가격+단위 (시트에서 만든 것)
            const change = row.c[2]?.v; // C열: 대비
            const pct = row.c[3]?.v;    // D열: 등락률

            if (!name || !priceWithUnit) return;

            const isUp = change >= 0;
            const colorClass = isUp ? "up" : "down";
            const sign = isUp ? "▲" : "▼";
            const formattedPct = (pct * 100).toFixed(2);

            // 기존 주식아가방 아이템 구조에 맞춤
            htmlContent += `
                <span class="item">
                    ${name} 
                    <span class="${colorClass}">
                        ${priceWithUnit} ${sign}${Math.abs(change).toFixed(2)} 
                        <span class="percent">(${formattedPct}%)</span>
                    </span>
                </span>`;
        });

        if(htmlContent) {
            // 무한 루프를 위해 두 번 반복
            content.innerHTML = htmlContent + htmlContent;
        }
    } catch (e) {
        console.error("데이터 로드 실패:", e);
    }
}

// 초기 실행 및 인터벌 설정
updateMarketInfo();
setInterval(updateMarketInfo, 1000);
getMarketData();
setInterval(getMarketData, 60000); // 1분마다 갱신 (방송 송출 안정성 최적화)
