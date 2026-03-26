// 발급받은 본인의 서비스키를 여기에 입력하세요
const SERVICE_KEY = '1d1043efb7e415ec16b01e63c91431f9ef51e9fe28d3be82ef841228537ed315';

async function getDomesticData() {
    const content = document.getElementById('ticker-content');
    if (!content) return;

    let items = [];
    
    // 1. 코스피/코스닥 지수 호출 (공공데이터포털 API 예시 구조)
    try {
        const url = `https://apis.data.go.kr/1160100/service/GetIndexQuotationsService/getIndexQuotations?serviceKey=${SERVICE_KEY}&resultType=json&numOfRows=5&pageNo=1`;
        
        const res = await fetch(url);
        const data = await res.json();
        const stockItems = data.response.body.items.item;

        stockItems.forEach(stock => {
            // 방송에 필요한 지수만 필터링 (코스피, 코스닥)
            if (stock.idxNm === "코스피" || stock.idxNm === "코스닥") {
                const price = parseFloat(stock.clpr).toFixed(2); // 종가
                const change = parseFloat(stock.vs).toFixed(2); // 전일대비
                const fltRt = parseFloat(stock.fltRt).toFixed(2); // 등락률
                
                const colorClass = change >= 0 ? "up" : "down";
                const sign = change >= 0 ? "▲" : "▼";

                items.push(`
                    <span class="item">
                        ${stock.idxNm} 
                        <span class="${colorClass}">
                            ${price} ${sign}${Math.abs(change)} 
                            <span class="percent">(${fltRt}%)</span>
                        </span>
                    </span>
                `);
            }
        });
    } catch (e) {
        console.error("국내 데이터 로드 실패", e);
    }

    // 2. 미국 지수 및 유가는 기존 야후 방식을 병행하는 것이 효율적입니다.
    // (공공데이터는 국내 데이터 중심이기 때문입니다.)
    // ... 기존 야후 로직 추가 가능 ...

    if(items.length > 0) {
        content.innerHTML = items.join("") + items.join("");
    }
}

// 갱신 주기: 방송용으로 10초 설정
setInterval(getDomesticData, 10000);
getDomesticData();
