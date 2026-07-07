/**
 * 2026 LCK 정규시즌 1~2라운드 데이터셋 (업데이트 반영)
 * 엑셀 데이터를 코드로 정규화하여 구조화함.
 */
const LCK_DATA = {
    // 업데이트된 팀 리스트
    teams: ["BFX", "DNS", "DK", "GEN", "BRO", "HLE", "KRX", "KT", "NS", "T1"],
    
    // 글로벌 파워 랭킹 데이터 (0~1 정규화)
    // 원본 데이터의 최대값(HLE: 1538점)을 기준으로 각 팀의 점수를 나누어 0~1 사이의 비율로 정규화함.
    // 예: BFX(1281) / 1538 = 0.833
    powerRanking: {
        "BFX": 0.833, "DNS": 0.717, "DK": 0.880, "GEN": 0.994, "BRO": 0.787,
        "HLE": 1.000, "KRX": 0.796, "KT": 0.908, "NS": 0.786, "T1": 0.988
    },
    
    // 최근 5경기 승률 (0~1 범위)
    recent5: {
        "BFX": 0.2, "DNS": 0.0, "DK": 0.6, "GEN": 0.8, "BRO": 0.0,
        "HLE": 0.8, "KRX": 0.4, "KT": 0.4, "NS": 0.2, "T1": 0.8
    },
    
    // 10x10 상대 전적 행렬 (Row팀 기준 Column팀을 상대로 한 매치/세트 승률)
    // 제공해주신 CSV 파일 데이터를 그대로 매핑. 비어있는 본인 대 본인 값은 0.5로 설정.
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

/**
 * [데이터 로드 및 초기화 함수]
 */
function getTeamData() {
    return LCK_DATA;
}

// UI 요소 셀렉터 객체
const DOM = {
    teamA: document.getElementById('teamA'),
    teamB: document.getElementById('teamB'),
    modelType: document.getElementById('modelType'),
    predictBtn: document.getElementById('predictBtn'),
    resultCard: document.getElementById('resultCard'),
    predictedWinner: document.getElementById('predictedWinner'),
    nameA: document.getElementById('nameA'),
    nameB: document.getElementById('nameB'),
    pctA: document.getElementById('pctA'),
    pctB: document.getElementById('pctB'),
    barA: document.getElementById('barA'),
    barB: document.getElementById('barB'),
    
    // 슬라이더 및 가중치 표시 텍스트
    impHeadToHead: document.getElementById('impHeadToHead'),
    impPowerRanking: document.getElementById('impPowerRanking'),
    impRecent5: document.getElementById('impRecent5'),
    impHeadToHeadVal: document.getElementById('impHeadToHeadVal'),
    impPowerRankingVal: document.getElementById('impPowerRankingVal'),
    impRecent5Val: document.getElementById('impRecent5Val'),
    weightHeadToHead: document.getElementById('weightHeadToHead'),
    weightPowerRanking: document.getElementById('weightPowerRanking'),
    weightRecent5: document.getElementById('weightRecent5'),
    
    // 분석 내용
    factorHeadToHead: document.getElementById('factorHeadToHead'),
    factorPower: document.getElementById('factorPower'),
    factorRecent: document.getElementById('factorRecent'),
    modelExplanation: document.getElementById('modelExplanation')
};

// 전역 가중치 변수
let weights = { h2h: 0.5, power: 0.3, recent: 0.2 };

/**
 * =================================================================
 * [UI 제어 및 데이터 연동 영역]
 * =================================================================
 */

// 초기화 실행
document.addEventListener('DOMContentLoaded', () => {
    initDropdowns();
    updateWeights();
    setupEventListeners();
});

// 드롭다운 초기화
function initDropdowns() {
    const data = getTeamData();
    data.teams.forEach((team, index) => {
        const optionA = new Option(team, team);
        const optionB = new Option(team, team);
        
        DOM.teamA.add(optionA);
        DOM.teamB.add(optionB);
    });
    
    // 초기 선택 다르게 설정 (기본값: T1 vs GEN)
    DOM.teamA.value = "T1";
    DOM.teamB.value = "GEN";
    checkSameTeam();
}

// 이벤트 리스너 바인딩
function setupEventListeners() {
    DOM.teamA.addEventListener('change', checkSameTeam);
    DOM.teamB.addEventListener('change', checkSameTeam);
    
    const sliders = [DOM.impHeadToHead, DOM.impPowerRanking, DOM.impRecent5];
    sliders.forEach(slider => {
        slider.addEventListener('input', updateWeights);
    });
    
    DOM.predictBtn.addEventListener('click', runPrediction);
}

// 동일 팀 선택 시 버튼 비활성화 검증
function checkSameTeam() {
    DOM.predictBtn.disabled = DOM.teamA.value === DOM.teamB.value;
}

// 중요도(Importance) 값을 가중치(Weight)로 실시간 정규화 계산
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

/**
 * =================================================================
 * [수학적 예측 모델 알고리즘 영역]
 * =================================================================
 */

function runPrediction() {
    const teamA = DOM.teamA.value;
    const teamB = DOM.teamB.value;
    const model = DOM.modelType.value;
    const data = getTeamData();
    
    const h2hA = data.headToHead[teamA][teamB];
    const h2hB = data.headToHead[teamB][teamA];
    const powerA = data.powerRanking[teamA];
    const powerB = data.powerRanking[teamB];
    const recentA = data.recent5[teamA];
    const recentB = data.recent5[teamB];
    
    let probA = 0;
    let probB = 0;
    
    if (model === "arithmetic") {
        const scoreA = (h2hA * weights.h2h) + (powerA * weights.power) + (recentA * weights.recent);
        const scoreB = (h2hB * weights.h2h) + (powerB * weights.power) + (recentB * weights.recent);
        
        probA = scoreA / (scoreA + scoreB);
        probB = scoreB / (scoreA + scoreB);
    } else if (model === "logistic") {
        const scoreA = (h2hA * weights.h2h) + (powerA * weights.power) + (recentA * weights.recent);
        const scoreB = (h2hB * weights.h2h) + (powerB * weights.power) + (recentB * weights.recent);
        
        const deltaS = scoreA - scoreB;
        const k = 4.0;
        
        probA = 1 / (1 + Math.exp(-k * deltaS));
        probB = 1 - probA;
    }
    
    const pctAVal = (probA * 100).toFixed(1);
    const pctBVal = (probB * 100).toFixed(1);
    
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
    
    renderFactorAnalysis(teamA, teamB, h2hA, h2hB, powerA, powerB, recentA, recentB, model);
}

function renderFactorAnalysis(teamA, teamB, h2hA, h2hB, powerA, powerB, recentA, recentB, model) {
    let h2hText = `<strong>상대전적 (가중치 ${(weights.h2h * 100).toFixed(0)}%):</strong> `;
    if (h2hA > h2hB) {
        h2hText += `1~2라운드 상대 승률에서 ${teamA}가 ${(h2hA*100).toFixed(0)}%로 우위를 점하고 있습니다.`;
    } else if (h2hB > h2hA) {
        h2hText += `${teamB}가 ${teamA}를 상대로 ${(h2hB*100).toFixed(0)}%의 높은 승률을 기록하여 상성상 앞서 있습니다.`;
    } else {
        h2hText += `두 팀의 이전 상대 전적은 대등하거나 데이터가 중립(50%)입니다.`;
    }
    DOM.factorHeadToHead.innerHTML = h2hText;
    
    let powerText = `<strong>Power Ranking (가중치 ${(weights.power * 100).toFixed(0)}%):</strong> `;
    if (powerA > powerB) {
        powerText += `글로벌 객관적 전력 지표에서 ${teamA}(${powerA.toFixed(3)})가 ${teamB}(${powerB.toFixed(3)})보다 기본 체급이 우세합니다.`;
    } else if (powerB > powerA) {
        powerText += `파워 랭킹 지표에서 ${teamB}(${powerB.toFixed(3)})가 ${teamA}(${powerA.toFixed(3)})보다 더 높은 체급을 보여줍니다.`;
    } else {
        powerText += `두 팀의 글로벌 파워 랭킹 지표가 대등합니다.`;
    }
    DOM.factorPower.innerHTML = powerText;
    
    let recentText = `<strong>최근 경기력 (가중치 ${(weights.recent * 100).toFixed(0)}%):</strong> `;
    if (recentA > recentB) {
        recentText += `최근 5경기 승률 흐름은 ${teamA}( ${(recentA*100).toFixed(0)}% )가 ${teamB}( ${(recentB*100).toFixed(0)}% )에 비해 기세가 더 좋습니다.`;
    } else if (recentB > recentA) {
        recentText += `${teamB}의 최근 5경기 승률이 ${(recentB*100).toFixed(0)}%로, ${teamA}보다 단기 폼이 앞서고 있습니다.`;
    } else {
        recentText += `두 팀 모두 최근 5경기 승률이 ${(recentA*100).toFixed(0)}%로 폼과 흐름이 비슷합니다.`;
    }
    DOM.factorRecent.innerHTML = recentText;

    if (model === "arithmetic") {
        DOM.modelExplanation.innerHTML = `💡 <strong>모델 수학적 해설:</strong> 현재 결과는 각 지표의 단순 비율을 구하는 <strong>'가중 산술 평균 모델'</strong>을 통해 도출되었습니다. 두 팀의 전력 점수를 선형적인 비율 분할($Score_A / (Score_A + Score_B)$)로 정규화했기 때문에 격차가 완만하게 반영됩니다.`;
    } else {
        DOM.modelExplanation.innerHTML = `💡 <strong>모델 수학적 해설:</strong> 현재 결과는 고교 미적분의 지수함수를 접목한 <strong>'가중 점수 차이 기반 로지스틱 모델'</strong>로 계산되었습니다. 두 팀의 종합 점수 편차(ΔS)에 대해 자연상수 $e$를 분모에 둔 시그모이드 함수를 적용함으로써, 전력의 미세한 우위가 실제 경기 승률상에서는 비선형적으로 증폭되어 더욱 실감 나는 예측 확률을 보여줍니다.`;
    }
}
