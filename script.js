/**
 * 2026 LCK 정규시즌 데이터셋 (사용자 업로드 CSV 반영)
 */
const LCK_DATA = {
    // 1. 팀 리스트 정의
    teams: ["BFX", "DNS", "DK", "GEN", "BRO", "HLE", "KRX", "KT", "NS", "T1"],
    
    // 2. 글로벌 파워 랭킹 데이터 (최고점 HLE: 1538점 기준 정규화 완료)
    powerRanking: {
        "BFX": 0.833, "DNS": 0.717, "DK": 0.880, "GEN": 0.994, "BRO": 0.787,
        "HLE": 1.000, "KRX": 0.796, "KT": 0.908, "NS": 0.786, "T1": 0.988
    },
    
    // 3. 최근 5경기 승률 흐름 지표
    recent5: {
        "BFX": 0.2, "DNS": 0.0, "DK": 0.6, "GEN": 0.8, "BRO": 0.0,
        "HLE": 0.8, "KRX": 0.4, "KT": 0.4, "NS": 0.2, "T1": 0.8
    },
    
    // 4. 10x10 상대 전적 데이터 행렬 (Row 팀 기준 Column 팀을 상대한 매치 승률)
    headToHead: {
        "BFX": {"BFX": 0.5, "DNS": 1, "DK": 0, "GEN": 0, "BRO": 0, "HLE": 0, "KRX": 1, "KT": 0.5, "NS": 0.5, "T1": 0},
        "DNS": {"BFX": 0, "DNS": 0.5, "DK": 0, "GEN": 0, "BRO": 0, "HLE": 0, "KRX": 0.5, "KT": 0, "NS": 0, "T1": 0},
        "DK":  {"BFX": 1, "DNS": 1, "DK": 0.5, "GEN": 0.5, "BRO": 1, "HLE": 0, "KRX": 1, "KT": 0, "NS": 0.5, "T1": 0.5},
        "GEN": {"BFX": 1, "DNS": 1, "DK": 0.5, "GEN": 0.5, "BRO": 1, "HLE": 0.5, "KRX": 1, "KT": 0.5, "NS": 1, "T1": 0.5},
        "BRO": {"BFX": 1, "DNS": 1, "DK": 0, "GEN": 0, "BRO": 0.5, "HLE": 0, "KRX": 0, "KT": 0.5, "NS": 0.5, "T1": 0},
        "HLE": {"BFX": 1, "DNS": 1, "DK": 1, "GEN": 0.5, "BRO": 1, "HLE": 0.5, "KRX": 0, "KT": 0.5, "NS": 1, "T1": 0.5},
        "KRX": {"BFX": 0, "DNS": 0.5, "DK": 0, "GEN": 0, "BRO": 1, "HLE": 0, "KRX": 0.5, "KT": 0, "NS": 1, "T1": 0},
        "KT":  {"BFX": 0.5, "DNS": 1, "DK": 1, "GEN": 0.5, "BRO": 0.5, "HLE": 0.5, "KRX": 1, "KT": 0.5, "NS": 1, "T1": 0.5},
        "NS":  {"BFX": 0.5, "DNS": 1, "DK": 0.5, "GEN": 0, "BRO": 0.5, "HLE": 0, "KRX": 0, "KT": 0, "NS": 0.5, "T1": 0},
        "T1":  {"BFX": 1, "DNS": 1, "DK": 0.5, "GEN": 0.5, "BRO": 1, "HLE": 0.5, "KRX": 1, "KT": 0.5, "NS": 1, "T1": 0.5}
    }
};

// UI DOM 요소 객체 맵
const DOM = {
    teamA: document.getElementById('teamA'),
    teamB: document.getElementById('teamB'),
    predictBtn: document.getElementById('predictBtn'),
    resultCard: document.getElementById('resultCard'),
    predictedWinner: document.getElementById('predictedWinner'),
    nameA: document.getElementById('nameA'),
    nameB: document.getElementById('nameB'),
    pctA: document.getElementById('pctA'),
    pctB: document.getElementById('pctB'),
    barA: document.getElementById('barA'),
    barB: document.getElementById('barB'),
    
    // 슬라이더 및 가중치 수치 노드
    impHeadToHead: document.getElementById('impHeadToHead'),
    impPowerRanking: document.getElementById('impPowerRanking'),
    impRecent5: document.getElementById('impRecent5'),
    impHeadToHeadVal: document.getElementById('impHeadToHeadVal'),
    impPowerRankingVal: document.getElementById('impPowerRankingVal'),
    impRecent5Val: document.getElementById('impRecent5Val'),
    weightHeadToHead: document.getElementById('weightHeadToHead'),
    weightPowerRanking: document.getElementById('weightPowerRanking'),
    weightRecent5: document.getElementById('weightRecent5'),
    
    // 분석 내용 박스
    factorHeadToHead: document.getElementById('factorHeadToHead'),
    factorPower: document.getElementById('factorPower'),
    factorRecent: document.getElementById('factorRecent')
};

// 가중치 전역 상태 변수
let weights = { h2h: 0.5, power: 0.3, recent: 0.2 };

// 앱 로드 및 리스너 초기화
document.addEventListener('DOMContentLoaded', () => {
    initDropdowns();
    updateWeights();
    setupEventListeners();
});

// 셀렉트 박스 옵션 동적 생성
function initDropdowns() {
    LCK_DATA.teams.forEach((team) => {
        DOM.teamA.add(new Option(team, team));
        DOM.teamB.add(new Option(team, team));
    });
    
    // 기본 디폴트 매치업 설정
    DOM.teamA.value = "T1";
    DOM.teamB.value = "GEN";
    checkSameTeam();
}

function setupEventListeners() {
    DOM.teamA.addEventListener('change', checkSameTeam);
    DOM.teamB.addEventListener('change', checkSameTeam);
    
    [DOM.impHeadToHead, DOM.impPowerRanking, DOM.impRecent5].forEach(slider => {
        slider.addEventListener('input', updateWeights);
    });
    
    DOM.predictBtn.addEventListener('click', runPrediction);
}

// 동일한 팀 매칭 검증 제어
function checkSameTeam() {
    DOM.predictBtn.disabled = DOM.teamA.value === DOM.teamB.value;
}

// 슬라이더 입력값을 기반으로 합계 100% 비율 정규화 처리
function updateWeights() {
    const impH2H = parseInt(DOM.impHeadToHead.value);
    const impPower = parseInt(DOM.impPowerRanking.value);
    const impRecent = parseInt(DOM.impRecent5.value);
    
    DOM.impHeadToHeadVal.innerText = impH2H;
    DOM.impPowerRankingVal.innerText = impPower;
    DOM.impRecent5Val.innerText = impRecent;
    
    const totalImp = impH2H + impPower + impRecent;
    
    if (totalImp === 0) {
        weights.h2h = 0.3333;
        weights.power = 0.3333;
        weights.recent = 0.3333;
    } else {
        weights.h2h = impH2H / totalImp;
        weights.power = impPower / totalImp;
        weights.recent = impRecent / totalImp;
    }
    
    DOM.weightHeadToHead.innerText = (weights.h2h * 100).toFixed(1) + "%";
    DOM.weightPowerRanking.innerText = (weights.power * 100).toFixed(1) + "%";
    DOM.weightRecent5.innerText = (weights.recent * 100).toFixed(1) + "%";
}

// 승리 예측 엔진 핵심 함수 (가중 산술 평균 모델 상시 고정)
function runPrediction() {
    const teamA = DOM.teamA.value;
    const teamB = DOM.teamB.value;
    
    const h2hA = LCK_DATA.headToHead[teamA][teamB];
    const h2hB = LCK_DATA.headToHead[teamB][teamA];
    const powerA = LCK_DATA.powerRanking[teamA];
    const powerB = LCK_DATA.powerRanking[teamB];
    const recentA = LCK_DATA.recent5[teamA];
    const recentB = LCK_DATA.recent5[teamB];
    
    // 각 지표점수의 가중합 연산
    const scoreA = (h2hA * weights.h2h) + (powerA * weights.power) + (recentA * weights.recent);
    const scoreB = (h2hB * weights.h2h) + (powerB * weights.power) + (recentB * weights.recent);
    
    // 가중 산술 평균 모델 알고리즘 작동
    const probA = scoreA / (scoreA + scoreB);
    const probB = scoreB / (scoreA + scoreB);
    
    const pctAVal = (probA * 100).toFixed(1);
    const pctBVal = (probB * 100).toFixed(1);
    
    // UI에 결과 매핑 출력
    DOM.resultCard.classList.remove('hidden');
    
    if (probA > probB) {
        DOM.predictedWinner.innerText = teamA + " 승리 예상";
    } else if (probB > probA) {
        DOM.predictedWinner.innerText = teamB + " 승리 예상";
    } else {
        DOM.predictedWinner.innerText = "백중세 (무승부/동률)";
    }
    
    DOM.nameA.innerText = teamA;
    DOM.nameB.innerText = teamB;
    DOM.pctA.innerText = pctAVal + "%";
    DOM.pctB.innerText = pctBVal + "%";
    
    DOM.barA.style.width = pctAVal + "%";
    DOM.barB.style.width = pctBVal + "%";
    
    renderFactorAnalysis(teamA, teamB, h2hA, h2hB, powerA, powerB, recentA, recentB);
}

// 요소 분석의 텍스트 설명 렌더링
function renderFactorAnalysis(teamA, teamB, h2hA, h2hB, powerA, powerB, recentA, recentB) {
    let h2hText = `<strong>상대전적 (가중치 ${(weights.h2h * 100).toFixed(0)}%):</strong> `;
    if (h2hA > h2hB) {
        h2hText += `1~2라운드 맞대결 승률에서 ${teamA}가 ${(h2hA*100).toFixed(0)}%로 우세를 점하고 있습니다.`;
    } else if (h2hB > h2hA) {
        h2hText += `${teamB}가 ${teamA}를 상대로 ${(h2hB*100).toFixed(0)}%의 승률을 기록하여 상성상 앞서 있습니다.`;
    } else {
        h2hText += `두 팀의 이전 맞대결 상대 전적은 50%로 대등하거나 중립 상태입니다.`;
    }
    DOM.factorHeadToHead.innerHTML = h2hText;
    
    let powerText = `<strong>Power Ranking (가중치 ${(weights.power * 100).toFixed(0)}%):</strong> `;
    if (powerA > powerB) {
        powerText += `글로벌 전력 지표에서 ${teamA}(${powerA.toFixed(3)})가 ${teamB}(${powerB.toFixed(3)})보다 객관적 체급이 더 우세합니다.`;
    } else if (powerB > powerA) {
        powerText += `파워 랭킹 지표에서 ${teamB}(${powerB.toFixed(3)})가 ${teamA}(${powerA.toFixed(3)})보다 더 높은 체급을 보여줍니다.`;
    } else {
        powerText += `두 팀의 글로벌 파워 랭킹 체급 지표가 완벽히 대등합니다.`;
    }
    DOM.factorPower.innerHTML = powerText;
    
    let recentText = `<strong>최근 경기력 (가중치 ${(weights.recent * 100).toFixed(0)}%):</strong> `;
    if (recentA > recentB) {
        recentText += `최근 5경기 승률 흐름은 ${teamA}( ${(recentA*100).toFixed(0)}% )가 ${teamB}( ${(recentB*100).toFixed(0)}% )에 비해 단기 기세가 더 좋습니다.`;
    } else if (recentB > recentA) {
        recentText += `${teamB}의 최근 5경기 승률이 ${(recentB*100).toFixed(0)}%로, ${teamA}보다 단기 흐름 폼이 앞서고 있습니다.`;
    } else {
        recentText += `두 팀 모두 최근 5경기 승률이 ${(recentA*100).toFixed(0)}%로 폼과 밸런스가 비슷합니다.`;
    }
    DOM.factorRecent.innerHTML = recentText;
}