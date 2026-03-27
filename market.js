const SHEET_ID = '1VIvLvBigv9mbnPtGzFJP1R7O0YKB-VTCo4OOWZw8Evc';

// 1. 시간 및 장 상태 업데이트
function updateTime() {
    const now = new Date();
    const kst = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (9 * 3600000));
    
    const timeStr = kst.toLocaleTimeString('ko-KR', { hour12: false });
    const day = kst.getDay();
    const timeVal = kst.getHours() * 100 + kst.getMinutes();

    let status = (day === 0 || day === 6) ? "휴장" : 
                 (timeVal >= 900 && timeVal < 1530) ? "장중" : "마감";

    const timeEl = document.getElementById('current-time');
    if(timeEl) {
        timeEl.innerHTML = `${timeStr} <span class="status-badge">${status}</span>`;
    }
}

// 2. 구글 시트에서 데이터 가져오기
async function getMarketData() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
    
    try {
        const res = await fetch(url);
        const text = await res.text();
        // 구글 시트 특유의 JSONP 형식을 순수 JSON으로 파싱
        const json = JSON.parse(text.substring(47).slice(0, -2));
        const rows = json.table.rows;

        let html = "";
        rows.forEach((row, index) => {
            // 시트의 1행부터 데이터가 있다고 가정 (A:지수명, B:현재가, C:대비, D:등락률)
            const name = row.c[0]?.v;   
            const price = row.c[1]?.v;  
            const change = row.c[2]?.v; 
            const pct = row.c[3]?.v;    

            if (!name) return;

            const colorClass = change >= 0 ? "up" : "down";
            const sign = change >= 0 ? "▲" : "▼";
            const formattedPct = (pct * 100).toFixed(2);

            html += `
                <div class="item">
                    <span class="label">${name}</span>
                    <span class="${colorClass}">
                        ${price} ${sign}${Math.abs(change).toFixed(2)}
                        <span class="percent">(${formattedPct}%)</span>
                    </span>
                </div>`;
        });

        // 티커가 끊기지 않게 두 번 반복해서 넣어줌
        document.getElementById('ticker-content').innerHTML = html + html;
    } catch (e) {
        console.error("데이터 로드 실패:", e);
    }
}

// 초기 실행 및 반복 설정
updateTime();
setInterval(updateTime, 1000);
getMarketData();
setInterval(getMarketData, 60000); // 1분마다 갱신
