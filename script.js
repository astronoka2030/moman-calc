let configData = {};
let techBonusData = [];
let daysData = [];

async function loadAllJSON() {
  try {
    const [configRes, techRes, d1Res, d2Res, d3Res, d4Res, d5Res, d6Res] = await Promise.all([
      fetch('config.json'),
      fetch('tech_bonus.json'),
      fetch('day1.json'),
      fetch('day2.json'),
      fetch('day3.json'),
      fetch('day4.json'),
      fetch('day5.json'),
      fetch('day6.json')
    ]);

    configData = await configRes.json();
    techBonusData = await techRes.json();
    daysData = [
      await d1Res.json(),
      await d2Res.json(),
      await d3Res.json(),
      await d4Res.json(),
      await d5Res.json(),
      await d6Res.json()
    ];

    renderUI();
    loadInputs();
    calc();
  } catch (err) {
    console.error('JSON読み込みエラー:', err);
  }
}

function showModal(imgSrc) {
  const modal = document.getElementById('image-modal');
  const img = document.getElementById('modal-img');
  if (modal && img) {
    img.src = imgSrc;
    modal.style.display = 'flex';
  }
}

function closeModal() {
  const modal = document.getElementById('image-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function toggleDay(wrapperEl) {
  if (wrapperEl) {
    wrapperEl.classList.toggle('collapsed');
  }
}

function renderUI() {
  const bonusContainer = document.getElementById('bonus-container');
  if (bonusContainer) {
    bonusContainer.innerHTML = '';
    techBonusData.forEach(item => {
      const div = document.createElement('div');
      div.className = 'bonus-item';
      
      let optionsHtml = '';
      if (configData.level_options) {
        configData.level_options.forEach(opt => {
          const selected = (opt.level === configData.default_level) ? 'selected' : '';
          optionsHtml += `<option value="${opt.bonus}" ${selected}>Lv.${opt.level} (+${opt.bonus}%)</option>`;
        });
      }

      div.innerHTML = `
        <span>${item.name}:</span>
        <select id="${item.id}" class="bonus-select" onchange="calc()">${optionsHtml}</select>
      `;
      bonusContainer.appendChild(div);
    });
  }

  const daysContainer = document.getElementById('days-container');
  if (!daysContainer) return;
  daysContainer.innerHTML = '';

  daysData.forEach(day => {
    const dayWrap = document.createElement('div');
    dayWrap.className = 'day-wrapper';
    
    let html = `
      <div class="day-title" onclick="toggleDay(this.parentElement)">
        <span>${day.title}</span>
        <span class="day-subtotal" id="d${day.day}_total_disp">0 pt</span>
      </div>
      <div class="day-card">
    `;

    // 1日目：盛唐夜市（時間部分）
    if (day.day === 1 && day.night_market) {
      const helpBtn = day.night_market.help_img ? `<button class="help-btn" onclick="event.stopPropagation(); showModal('${day.night_market.help_img}')">💡 場所を確認</button>` : '';
      html += `
        <div class="item-row">
          <div class="label-container">
            <label>盛唐夜市：来客人数 (人/時間)</label>
            ${helpBtn}
          </div>
          <input type="text" id="d1_night_speed" class="save-input" placeholder="例: 2.73万 または 27300" value="${day.night_market.default_speed || ''}" oninput="calc()">
        </div>
        <div class="item-row">
          <div class="label-container"><label>盛唐夜市：貯めた時間 (時間 / 最大72時間)</label></div>
          <input type="text" id="d1_night_72h" class="save-input" placeholder="時間 (例: 72)" value="${day.night_market.default_h72 || ''}" oninput="calc()">
          <div class="sub-preview" id="d1_night_72h-p"></div>
        </div>
        <div class="item-row">
          <div class="label-container"><label>盛唐夜市：自然経過時間 (時間 / 最大22時間)</label></div>
          <input type="text" id="d1_night_22h" class="save-input" placeholder="時間 (例: 22)" value="${day.night_market.default_h22 || ''}" oninput="calc()">
          <div class="sub-preview" id="d1_night_22h-p"></div>
        </div>
      `;
    }

    // 5日目：諸子百家（時間部分）
    if (day.day === 5 && day.kangaku_market) {
      const helpBtn = day.kangaku_market.help_img ? `<button class="help-btn" onclick="event.stopPropagation(); showModal('${day.kangaku_market.help_img}')">💡 場所を確認</button>` : '';
      html += `
        <div class="item-row">
          <div class="label-container">
            <label>諸子百家：学習人数 (人/分)</label>
            ${helpBtn}
          </div>
          <input type="text" id="d5_kangaku_speed" class="save-input" placeholder="例: 410" value="${day.kangaku_market.default_speed || ''}" oninput="calc()">
        </div>
        <div class="item-row">
          <div class="label-container"><label>諸子百家：貯めた時間 (時間 / 最大72時間)</label></div>
          <input type="text" id="d5_kangaku_72h" class="save-input" placeholder="時間 (例: 72)" value="${day.kangaku_market.default_h72 || ''}" oninput="calc()">
          <div class="sub-preview" id="d5_kangaku_72h-p"></div>
        </div>
        <div class="item-row">
          <div class="label-container"><label>諸子百家：自然経過時間 (時間 / 最大22時間)</label></div>
          <input type="text" id="d5_kangaku_22h" class="save-input" placeholder="時間 (例: 22)" value="${day.kangaku_market.default_h22 || ''}" oninput="calc()">
          <div class="sub-preview" id="d5_kangaku_22h-p"></div>
        </div>
      `;
    }

    // アイテム展開
    if (day.items) {
      day.items.forEach(item => {
        const helpBtn = item.help_img ? `<button class="help-btn" onclick="event.stopPropagation(); showModal('${item.help_img}')">💡 場所を確認</button>` : '';
        
        let displayLabel = item.label;
        if (displayLabel.includes("盛唐夜市：来客")) displayLabel = "盛唐夜市：来客人数 (人/時間)";
        if (displayLabel === "砂時計1個あたりの貢物数" || displayLabel === '"時の砂"1個あたりの貢物数') displayLabel = "エジプト：時の砂1個あたりの貢物数";
        if (displayLabel === "エジプト：砂時計") displayLabel = "エジプト：時の砂";

        html += `<div class="item-row">`;
        html += `
          <div class="label-container">
            <label>${displayLabel}</label>
            ${helpBtn}
          </div>
        `;
        
        if (item.type === 'fixed_ship' || item.type === 'fixed_simple') {
          html += `<div class="sub-preview" id="${item.id}_disp"></div>`;
        } else if (item.type === 'd3_resource_fixed') {
          html += `<input type="text" id="${item.id}" class="save-input" placeholder="${item.placeholder || ''}" value="${item.default_value || ''}" oninput="calc()">`;
          if (item.note) html += `<div class="note-text">${item.note}</div>`;
          html += `<div class="sub-preview" id="d3_fixed_disp"></div>`;
        } else if (['sand_ratio', 'd4_patrol_land_val', 'd6_fukuryo_speed'].includes(item.type)) {
          html += `<input type="text" id="${item.id}" class="save-input" placeholder="${item.placeholder || ''}" value="${item.default_value || ''}" oninput="calc()">`;
          if (item.note) html += `<div class="note-text">${item.note}</div>`;
        } else {
          html += `<input type="text" id="${item.id}" class="save-input" placeholder="${item.placeholder || ''}" value="${item.default_value || ''}" oninput="calc()">`;
          if (item.note) html += `<div class="note-text">${item.note}</div>`;
          html += `<div class="sub-preview" id="${item.id}-p"></div>`;
        }
        
        html += `</div>`;
      });
    }

    html += `</div>`;
    dayWrap.innerHTML = html;
    daysContainer.appendChild(dayWrap);
  });
}

function parseNum(val) {
  if (!val) return 0;
  val = String(val).trim().replace(/,/g, '');
  if (val.endsWith('万')) {
    const num = parseFloat(val.replace('万', ''));
    return isNaN(num) ? 0 : Math.round(num * 10000);
  }
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
}

function fmtDayPt(pt) {
  const floorPt = Math.floor(pt);
  return floorPt >= 10000 ? `${(floorPt / 10000).toFixed(2)}万 pt` : `${floorPt.toLocaleString()} pt`;
}

function getMult(id) {
  const el = document.getElementById(id);
  const val = el ? parseFloat(el.value) || 0 : 0;
  return 1 + (val / 100);
}

function saveInputs() {
  document.querySelectorAll('.save-input').forEach(input => {
    localStorage.setItem('moman_' + input.id, input.value);
  });
  document.querySelectorAll('.bonus-select').forEach(sel => {
    localStorage.setItem('moman_' + sel.id, sel.value);
  });
  document.querySelectorAll('.save-check').forEach(chk => {
    localStorage.setItem('moman_' + chk.id, chk.checked);
  });
}

function loadInputs() {
  document.querySelectorAll('.save-input').forEach(input => {
    const savedVal = localStorage.getItem('moman_' + input.id);
    if (savedVal !== null) input.value = savedVal;
  });
  
  document.querySelectorAll('.bonus-select').forEach(sel => {
    const savedVal = localStorage.getItem('moman_' + sel.id);
    if (savedVal !== null) {
      const exists = Array.from(sel.options).some(opt => opt.value === savedVal);
      const defaultBonus = configData.level_options ? configData.level_options.find(o => o.level === configData.default_level)?.bonus : 75;
      sel.value = exists ? savedVal : String(defaultBonus);
    }
  });
  
  document.querySelectorAll('.save-check').forEach(chk => {
    const savedVal = localStorage.getItem('moman_' + chk.id);
    if (savedVal !== null) chk.checked = (savedVal === 'true');
  });
}

function clearAll() {
  if (confirm('すべての入力数値をクリア（リセット）しますか？')) {
    document.querySelectorAll('.save-input').forEach(input => {
      if (input.id === 'd3_item_count') input.value = '18';
      else if (input.id === 'd1_night_speed') input.value = '2.73万';
      else if (input.id === 'd1_night_72h') input.value = '72';
      else if (input.id === 'd1_night_22h') input.value = '22';
      else if (input.id === 'd2_sand_ratio') input.value = '57';
      else if (input.id === 'd4_patrol_land_val') input.value = '2.24万';
      else if (input.id === 'd5_kangaku_speed') input.value = '410';
      else if (input.id === 'd5_kangaku_card_people') input.value = '410';
      else if (input.id === 'd5_kangaku_72h') input.value = '72';
      else if (input.id === 'd5_kangaku_22h') input.value = '22';
      else if (input.id === 'd6_fukuryo_speed') input.value = '300';
      else if (input.id === 'd6_fukuryo_hours') input.value = '200';
      else input.value = '';
      localStorage.removeItem('moman_' + input.id);
    });
    calc();
  }
}

function calc() {
  saveInputs();
  let grandTotal = 0;

  daysData.forEach(day => {
    let dayTotal = 0;

    // 1日目：盛唐夜市経過計算
    if (day.night_market) {
      const d1_speed = parseNum(document.getElementById('d1_night_speed')?.value);
      const d1_h72 = parseNum(document.getElementById('d1_night_72h')?.value);
      const d1_h22 = parseNum(document.getElementById('d1_night_22h')?.value);
      
      const pt72 = d1_h72 * (d1_speed / 10000) * 100;
      const pt22 = d1_h22 * (d1_speed / 10000) * 100;
      
      const p72El = document.getElementById('d1_night_72h-p');
      if (p72El) p72El.innerText = d1_h72 ? `${d1_h72}時間 ➔ ${pt72.toLocaleString(undefined, {maximumFractionDigits: 1})} pt` : '';

      const p22El = document.getElementById('d1_night_22h-p');
      if (p22El) p22El.innerText = d1_h22 ? `${d1_h22}時間 ➔ ${pt22.toLocaleString(undefined, {maximumFractionDigits: 1})} pt` : '';

      dayTotal += (pt72 + pt22);
    }

    // 5日目：諸子百家経過計算
    if (day.kangaku_market) {
      const d5_speed = parseNum(document.getElementById('d5_kangaku_speed')?.value);
      const d5_h72 = parseNum(document.getElementById('d5_kangaku_72h')?.value);
      const d5_h22 = parseNum(document.getElementById('d5_kangaku_22h')?.value);
      
      const pt72 = d5_speed * 60 * d5_h72 * 0.01;
      const pt22 = d5_speed * 60 * d5_h22 * 0.01;

      const p72El = document.getElementById('d5_kangaku_72h-p');
      if (p72El) p72El.innerText = d5_h72 ? `${d5_h72}時間 ➔ ${pt72.toLocaleString(undefined, {maximumFractionDigits: 1})} pt` : '';

      const p22El = document.getElementById('d5_kangaku_22h-p');
      if (p22El) p22El.innerText = d5_h22 ? `${d5_h22}時間 ➔ ${pt22.toLocaleString(undefined, {maximumFractionDigits: 1})} pt` : '';

      dayTotal += (pt72 + pt22);
    }

    if (day.items) {
      day.items.forEach(item => {
        const mult = item.tech_key ? getMult(item.tech_key) : 1;
        let itemPt = 0;

        if (item.type === 'senden') {
          const d1_speed = parseNum(document.getElementById('d1_night_speed')?.value);
          const sendenN = parseNum(document.getElementById(item.id)?.value);
          itemPt = sendenN * ((d1_speed / 10000) / 6) * 100;
          const pEl = document.getElementById(`${item.id}-p`);
          if (pEl) pEl.innerText = sendenN ? `${sendenN.toLocaleString()}枚 ➔ ${itemPt.toLocaleString(undefined, {maximumFractionDigits: 1})} pt` : '';
        }
        else if (item.type === 'd6_fukuryo_hours') {
          const speedVal = parseNum(document.getElementById('d6_fukuryo_speed')?.value);
          const hoursVal = parseNum(document.getElementById('d6_fukuryo_hours')?.value);

          const oneWayMin = (175000 / (speedVal + 25)) + 68;
          const totalChargeMin = hoursVal * 60;
          const trips = totalChargeMin / oneWayMin;
          const totalDist = trips * 2800;
          const basePt = Math.floor(totalDist / 500) * 100;
          itemPt = basePt * mult;

          const pEl = document.getElementById(`${item.id}-p`);
          if (pEl) {
            pEl.innerText = hoursVal ? `${hoursVal}時間 (移動約${trips.toFixed(1)}回 / ${Math.floor(totalDist).toLocaleString()}里) ➔ ${itemPt.toLocaleString(undefined, {maximumFractionDigits: 1})} pt` : '';
          }
        }
        else if (item.type === 'd6_fukuryo_item') {
          const speedVal = parseNum(document.getElementById('d6_fukuryo_speed')?.value);
          const itemN = parseNum(document.getElementById(item.id)?.value);

          const oneWayMin = (175000 / (speedVal + 25)) + 68;
          const totalChargeMin = itemN * 30;
          const trips = totalChargeMin / oneWayMin;
          const totalDist = trips * 2800;
          const basePt = Math.floor(totalDist / 500) * 100;
          itemPt = basePt * mult;

          const pEl = document.getElementById(`${item.id}-p`);
          if (pEl) {
            pEl.innerText = itemN ? `${itemN.toLocaleString()}個 (移動約${trips.toFixed(1)}回 / ${Math.floor(totalDist).toLocaleString()}里) ➔ ${itemPt.toLocaleString(undefined, {maximumFractionDigits: 1})} pt` : '';
          }
        }
        else if (item.type === 'patrol_item') {
          const itemN = parseNum(document.getElementById(item.id)?.value);
          const kokandoPtPerTimes = 20.8 * mult;
          itemPt = itemN * kokandoPtPerTimes;
          
          const pEl = document.getElementById(`${item.id}-p`);
          if (pEl) pEl.innerText = itemN ? `${itemN.toLocaleString()}個 (巡回${itemN.toLocaleString()}回分) ➔ ${itemPt.toLocaleString(undefined, {maximumFractionDigits: 1})} pt (期待値)` : '';
        }
        else if (item.type === 'd4_patrol_item') {
          const itemN = parseNum(document.getElementById(item.id)?.value);
          const rawLandVal = parseNum(document.getElementById('d4_patrol_land_val')?.value);
          const landValInMan = rawLandVal / 10000;
          const landPtPerTimes = landValInMan * 5 * mult;
          const dropItemPt = 4.467;
          itemPt = itemN * (landPtPerTimes + dropItemPt);

          const pEl = document.getElementById(`${item.id}-p`);
          if (pEl) pEl.innerText = itemN ? `${itemN.toLocaleString()}個 (巡回${itemN.toLocaleString()}回分) ➔ ${itemPt.toLocaleString(undefined, {maximumFractionDigits: 1})} pt (期待値)` : '';
        }
        else if (item.type === 'kangaku_card' || item.type === 'kangaku_card_people') {
          const speedVal = parseNum(document.getElementById('d5_kangaku_speed')?.value);
          const cardN = parseNum(document.getElementById(item.id)?.value);
          itemPt = cardN * speedVal * 0.01;
          const pEl = document.getElementById(`${item.id}-p`);
          if (pEl) pEl.innerText = cardN ? `${cardN.toLocaleString()}枚 ➔ ${itemPt.toLocaleString(undefined, {maximumFractionDigits: 1})} pt` : '';
        }
        else if (item.type === 'trib') {
          const num = parseNum(document.getElementById(item.id)?.value);
          const count = Math.floor(num / 100);
          itemPt = count * 25;
          const pEl = document.getElementById(`${item.id}-p`);
          if (pEl) pEl.innerText = num ? `祈祷${count.toLocaleString()}回分 ➔ ${itemPt.toLocaleString(undefined, {maximumFractionDigits: 1})} pt` : '';
        }
        else if (item.type === 'sand') {
          const ratio = parseNum(document.getElementById('d2_sand_ratio')?.value);
          const num = parseNum(document.getElementById(item.id)?.value);
          const tribTotal = num * ratio;
          const count = Math.floor(tribTotal / 100);
          itemPt = count * 25;
          const pEl = document.getElementById(`${item.id}-p`);
          if (pEl) pEl.innerText = num ? `時の砂${num.toLocaleString()}個 (貢物${tribTotal.toLocaleString()}個 / 祈祷${count.toLocaleString()}回分) ➔ ${itemPt.toLocaleString(undefined, {maximumFractionDigits: 1})} pt` : '';
        }
        else if (['sand_ratio', 'd4_patrol_land_val', 'd6_fukuryo_speed'].includes(item.type)) {
          itemPt = 0;
        }
        else if (item.type === 'nikuman') {
          const num = parseNum(document.getElementById(item.id)?.value);
          itemPt = num * 3 * 20 * mult;
          const pEl = document.getElementById(`${item.id}-p`);
          if (pEl) pEl.innerText = num ? `スタミナ${(num*3).toLocaleString()}回復 ➔ ${itemPt.toLocaleString(undefined, {maximumFractionDigits: 1})} pt` : '';
        }
        else if (item.type === 'fixed_ship') {
          itemPt = item.base_pt * mult;
          const el = document.getElementById(`${item.id}_disp`);
          if (el) el.innerText = `${Math.floor(itemPt).toLocaleString()} pt 固定 (船団派遣倍率反映)`;
        }
        else if (item.type === 'fixed_simple') {
          itemPt = item.base_pt;
          const el = document.getElementById(`${item.id}_disp`);
          if (el) el.innerText = `${Math.floor(itemPt).toLocaleString()} pt 固定`;
        }
        else if (item.type === 'd3_resource_fixed') {
          const itemCount = parseNum(document.getElementById(item.id)?.value);
          itemPt = item.base_per_item * itemCount * mult;
          const el = document.getElementById('d3_fixed_disp');
          if (el) el.innerText = `${Math.floor(itemPt).toLocaleString()} pt 固定 (×${itemCount}品目 / 領地資源倍率反映)`;
        }
        else {
          const num = parseNum(document.getElementById(item.id)?.value);
          itemPt = num * item.unit_pt * mult;
          const pEl = document.getElementById(`${item.id}-p`);
          if (pEl) pEl.innerText = num ? `${num.toLocaleString()} ➔ ${itemPt.toLocaleString(undefined, {maximumFractionDigits: 1})} pt` : '';
        }

        dayTotal += itemPt;
      });
    }

    const dayDisp = document.getElementById(`d${day.day}_total_disp`);
    if (dayDisp) dayDisp.innerText = fmtDayPt(dayTotal);

    grandTotal += dayTotal;
  });

  const totalPtEl = document.getElementById('total-pt');
  const totalManEl = document.getElementById('total-man');
  if (totalPtEl) totalPtEl.innerText = Math.floor(grandTotal).toLocaleString();
  if (totalManEl) totalManEl.innerText = `（約 ${(grandTotal / 10000).toFixed(2)} 万pt）`;
}

window.addEventListener('DOMContentLoaded', () => {
  loadAllJSON();
});

function toggleBonus() {
  const wrapper = document.getElementById('bonus-wrapper');
  if (wrapper) {
    wrapper.classList.toggle('collapsed');
  }
}

