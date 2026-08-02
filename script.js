// ツイステ全22名の誕生日データ（MM-DD）
const twstCharacters = {
    heartslabyul: [
        { name: "リドル・ローズハート", birthday: "08-24" },
        { name: "エース・トラッポラ", birthday: "09-23" },
        { name: "デュース・スペード", birthday: "06-03" },
        { name: "トレイ・クローバー", birthday: "10-25" },
        { name: "ケイト・ダイヤモンド", birthday: "02-04" }
    ],
    savanaclaw: [
        { name: "レオナ・キングスカラー", birthday: "07-27" },
        { name: "ジャック・ハウル", birthday: "10-11" },
        { name: "ラギー・ブッチ", birthday: "04-18" }
    ],
    octavinelle: [
        { name: "アズール・アーシェングロット", birthday: "02-24" },
        { name: "ジェイド・リーチ", birthday: "11-05" },
        { name: "フロイド・リーチ", birthday: "11-05" }
    ],
    scarabia: [
        { name: "カリム・アルアジーム", birthday: "06-25" },
        { name: "ジャミル・バイパー", birthday: "09-12" }
    ],
    pomefiore: [
        { name: "ヴィル・シェーンハイト", birthday: "04-09" },
        { name: "エペル・フェルミエ", birthday: "05-06" },
        { name: "ルーク・ハント", birthday: "12-02" }
    ],
    ignihyde: [
        { name: "イデア・シュラウド", birthday: "12-18" },
        { name: "オルト・シュラウド", birthday: "08-14" }
    ],
    diasomnia: [
        { name: "マレウス・ドラコニア", birthday: "01-18" },
        { name: "リリア・ヴァンルージュ", birthday: "01-01" },
        { name: "シルバー", birthday: "05-15" },
        { name: "セベク・ジグボルト", birthday: "03-17" }
    ]
};

// 全22名の誕生日リストを1つの配列にする
const allBirthdays = [];
Object.values(twstCharacters).forEach(dorm => {
    dorm.forEach(chara => allBirthdays.push(chara.birthday));
});

// 寮選択連動
document.getElementById('dormSelect').addEventListener('change', function() {
    const selectedDorm = this.value;
    const charaSelect = document.getElementById('charaSelect');
    const birthdayInput = document.getElementById('birthday');

    charaSelect.innerHTML = '<option value="">-- キャラを選択してね --</option>';
    birthdayInput.value = '';

    if (selectedDorm && twstCharacters[selectedDorm]) {
        charaSelect.disabled = false;
        twstCharacters[selectedDorm].forEach(chara => {
            const option = document.createElement('option');
            option.value = chara.birthday;
            option.textContent = chara.name;
            charaSelect.appendChild(option);
        });
    } else {
        charaSelect.disabled = true;
        charaSelect.innerHTML = '<option value="">-- まずは寮を選んでね --</option>';
    }
});

// キャラ選択連動
document.getElementById('charaSelect').addEventListener('change', function() {
    const selectedBirthday = this.value;
    const birthdayInput = document.getElementById('birthday');

    if (selectedBirthday) {
        const today = new Date();
        const year = today.getFullYear();
        birthdayInput.value = `${year}-${selectedBirthday}`;
    } else {
        birthdayInput.value = '';
    }
});

// 最安パック組み合わせ計算関数
function calculateBestPacks(neededStones, diffDays) {
    if (neededStones <= 0) return null;

    const packs = [
        { name: "1230個 (10,000円)", stones: 1230, price: 10000 },
        { name: "585個 (4,900円)", stones: 585, price: 4900 },
        { name: "353個 (3,000円)", stones: 353, price: 3000 },
        { name: "173個 (1,500円)", stones: 173, price: 1500 },
        { name: "113個 (1,000円)", stones: 113, price: 1000 },
        { name: "54個 (480円)", stones: 54, price: 480 },
        { name: "20個 (160円/デイリー)", stones: 20, price: 160, dailyLimit: true }
    ];

    let currentNeeded = neededStones;
    let totalPrice = 0;
    let totalBoughtStones = 0;
    let resultPacks = [];

    const dailyPack = packs.find(p => p.dailyLimit);
    if (dailyPack && diffDays > 0) {
        const neededDailyCount = Math.ceil(currentNeeded / dailyPack.stones);
        const actualDailyCount = Math.min(neededDailyCount, diffDays);

        if (actualDailyCount > 0) {
            const boughtFromDaily = actualDailyCount * dailyPack.stones;
            totalPrice += actualDailyCount * dailyPack.price;
            totalBoughtStones += boughtFromDaily;
            currentNeeded -= boughtFromDaily;
            resultPacks.push(`・20個パック (160円): <b>${actualDailyCount}回</b> (毎日1回購入)`);
        }
    }

    if (currentNeeded > 0) {
        for (let pack of packs) {
            if (pack.dailyLimit) continue;

            if (currentNeeded >= pack.stones) {
                const count = Math.floor(currentNeeded / pack.stones);
                totalPrice += count * pack.price;
                totalBoughtStones += count * pack.stones;
                currentNeeded -= count * pack.stones;
                resultPacks.push(`・${pack.name}: <b>${count}回</b>`);
            }
        }

        if (currentNeeded > 0) {
            const normalPacks = packs.filter(p => !p.dailyLimit);
            normalPacks.sort((a, b) => a.price - b.price);
            const fillPack = normalPacks.find(p => p.stones >= currentNeeded) || normalPacks[normalPacks.length - 1];

            totalPrice += fillPack.price;
            totalBoughtStones += fillPack.stones;
            resultPacks.push(`・${fillPack.name}: <b>1回</b>`);
        }
    }

    return {
        totalPrice: totalPrice,
        totalBoughtStones: totalBoughtStones,
        details: resultPacks
    };
}

// 計算処理
document.getElementById('calcBtn').addEventListener('click', function() {
    const currentStones = Number(document.getElementById('currentStones').value) || 0;
    const currentKeys10 = Number(document.getElementById('currentKeys10').value) || 0;
    const currentKeysSingle = Number(document.getElementById('currentKeysSingle').value) || 0;
    const targetPulls = Number(document.getElementById('targetPulls').value) || 100;
    
    const birthdayStr = document.getElementById('birthday').value;
    const myBirthdayStr = document.getElementById('myBirthday').value;
    const hasMonthlyPass = document.getElementById('hasMonthlyPass').checked;
    const resultDiv = document.getElementById('result');

    if (!birthdayStr) {
        resultDiv.textContent = '推しのキャラクターを選択してね！';
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let targetDate = new Date(birthdayStr);
    targetDate.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();
    targetDate.setFullYear(currentYear);
    if (targetDate < today) {
        targetDate.setFullYear(currentYear + 1);
    }

    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // --- 各種配布・イベントのカウント ---
    let weeklyBonusCount = 0;
    let shopExchangeCount = 0; // 毎月1日のショップ更新回数
    let charaBirthdayKeys = 0;
    let myBirthdayKeys = 0;

    let myBirthdayDate = null;
    if (myBirthdayStr) {
        myBirthdayDate = new Date(myBirthdayStr);
        myBirthdayDate.setHours(0, 0, 0, 0);
        myBirthdayDate.setFullYear(currentYear);
        if (myBirthdayDate < today) {
            myBirthdayDate.setFullYear(currentYear + 1);
        }
    }

    // 1日ずつループしてカウント
    let checkDate = new Date(today);
    while (checkDate < targetDate) {
        checkDate.setDate(checkDate.getDate() + 1);
        const mmdd = `${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;

        // 日曜日（ウィークリーミッション達成60個）
        if (checkDate.getDay() === 0) {
            weeklyBonusCount++;
        }

        // 毎月1日（ショップの10連鍵交換更新）
        if (checkDate.getDate() === 1) {
            shopExchangeCount++;
        }

        // キャラ誕生日（10連鍵1本）
        if (allBirthdays.includes(mmdd)) {
            charaBirthdayKeys++;
        }

        // 自分の誕生日（10連鍵1本）
        if (myBirthdayDate && checkDate.getTime() === myBirthdayDate.getTime()) {
            myBirthdayKeys++;
        }
    }

    // --- 石・鍵の計算 ---
    const weeklyEarnedStones = weeklyBonusCount * 60;
    
    let passEarnedStones = 0;
    if (hasMonthlyPass) {
        const passInitialStones = 59;
        const passDailyStones = diffDays * 5;
        passEarnedStones = passInitialStones + passDailyStones;
    }

    const oshiBirthdayKey = 1;

    // ショップ交換による石の消費と鍵の増加
    const shopUsedStones = shopExchangeCount * 250; // 消費する石
    const shopEarnedKeys10 = shopExchangeCount * 1;  // 増える10連鍵

    // 獲得する石の合計（獲得分からショップ消費分を引く）
    const grossEarnedStones = weeklyEarnedStones + passEarnedStones;
    const netEarnedStones = grossEarnedStones - shopUsedStones;
    
    // 獲得する10連鍵の合計
    const totalEarnedKeys10 = charaBirthdayKeys + myBirthdayKeys + oshiBirthdayKey + shopEarnedKeys10;

    // 最終的なトータル所持予測
    const finalStones = currentStones + netEarnedStones;
    const finalKeys10 = currentKeys10 + totalEarnedKeys10;
    const finalKeysSingle = currentKeysSingle;

    // ガチャ回数換算
    const stonesToPulls = Math.floor(finalStones / 30);
    const keys10ToPulls = finalKeys10 * 10;
    const keysSingleToPulls = finalKeysSingle;

    const totalPulls = stonesToPulls + keys10ToPulls + keysSingleToPulls;
    const pullsDiff = totalPulls - targetPulls;

    // 課金ルート計算（不足時）
    let packProposalHTML = "";
    if (pullsDiff < 0) {
        const neededPulls = Math.abs(pullsDiff);
        const neededStones = neededPulls * 30;
        const packResult = calculateBestPacks(neededStones, diffDays);

        if (packResult) {
            packProposalHTML = `
                <div class="pack-box">
                    💳 <b>最安の課金ルート提案</b><br>
                    不足分の約${neededPulls}回分（魔法石 ${neededStones}個）を補う場合：<br>
                    ${packResult.details.join('<br>')}<br>
                    👉 <b>予想合計金額：<span style="color:#d93838;">￥${packResult.totalPrice.toLocaleString()}</span></b>
                    <small>（魔法石 +${packResult.totalBoughtStones}個）</small>
                </div>
            `;
        }
    }

    // 結果の出力
    resultDiv.innerHTML = `
        推しのバースデーまであと <b>${diffDays}日</b>！<br><br>
        <b>【期間中に獲得できる予測】</b><br>
        ・魔法石：<b>${netEarnedStones.toLocaleString()}個</b><br>
        <small>（ミッション:${weeklyEarnedStones}${hasMonthlyPass ? ' / パス:' + passEarnedStones : ''}${shopExchangeCount > 0 ? ' / ショップ交換:-' + shopUsedStones : ''}）</small><br>
        ・10連キー：<b>${totalEarnedKeys10}本</b><br>
        <small>（他キャラ:${charaBirthdayKeys}本 / 自誕生日:${myBirthdayKeys}本 / 推し当日:1本${shopExchangeCount > 0 ? ' / ショップ交換:' + shopEarnedKeys10 + '本' : ''}）</small><br><br>

        <b>【バースデー当日の予想総所持】</b><br>
        ・魔法石：<b>${finalStones.toLocaleString()}個</b><br>
        ・10連キー：<b>${finalKeys10}本</b> / 単発キー：<b>${finalKeysSingle}本</b><br>
        👉 <b>合計：約 ${totalPulls} 回分</b> のガチャが可能！<br><br>

        <b>【目標：${targetPulls}回 に対して】</b><br>
        ${pullsDiff >= 0 
            ? `<span class="highlight">🎉 目標達成可能！ (約 +${pullsDiff}回分 余裕あり)</span>` 
            : `<span class="highlight">⚠️ あと約 ${Math.abs(pullsDiff)}回分 不足しています</span>${packProposalHTML}`}
    `;
});
