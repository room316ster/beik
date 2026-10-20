/**
 * ==============================================================================
 * JAVASCRIPT LOGIC - ระบบใบเบิกพัสดุ (143 รายการ 3 คอลัมน์ A4 หน้าเดียว)
 * ถอดแบบจากเอกสารจริง 100% พร้อมเชื่อมต่อ Google Sheets API & GitHub Pages
 * ==============================================================================
 */

// Web App URL เริ่มต้นของ Google Apps Script
const DEFAULT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzYph3CyOyROLyo_KnAYluZS8lc20CHw-3HiJ9uuW7XgSTCSGH7erXDSaAFxnj9cgsXHA/exec";

// LocalStorage Keys
const STORAGE_KEYS = {
  WEB_APP_URL: "req_system_web_app_url",
  FORM_HEADER: "req_system_header",
  REQUISITIONS: "req_system_history"
};

// ================= รายการพัสดุทั้ง 143 รายการ (ตรงตามภาพต้นฉบับ 100%) =================
const ITEMS_DATABASE = [
  // --- คอลัมน์ที่ 1: ลำดับที่ 1 - 50 ---
  { id: 1, name: "กระดาษถ่ายเอกสาร A4 80 แกรม", unit: "รีม" },
  { id: 2, name: "กระดาษถ่ายเอกสาร F14 80 แกรม", unit: "รีม" },
  { id: 3, name: "กระดาษต่อเนื่อง 9x11", unit: "รีม" },
  { id: 4, name: "กระดาษต่อเนื่อง F14", unit: "รีม" },
  { id: 5, name: "กระดาษทำการ A4", unit: "รีม" },
  { id: 6, name: "กระดาษทำการสี A4", unit: "รีม" },
  { id: 7, name: "กระดาษทำการมีหัว/ตาราง A4", unit: "รีม" },
  { id: 8, name: "กระดาษคาร์บอน", unit: "กล่อง" },
  { id: 9, name: "กาวน้ำใส", unit: "ขวด" },
  { id: 10, name: "กาว UHU", unit: "หลอด" },
  { id: 11, name: "กาว 2 หน้า แบบบาง 0.5 นิ้ว", unit: "ม้วน" },
  { id: 12, name: "กาว 2 หน้า แบบบาง 1 นิ้ว", unit: "ม้วน" },
  { id: 13, name: "กาว 2 หน้า แบบหนา", unit: "ม้วน" },
  { id: 14, name: "กระดาษกาวนิตโตะ ขนาด 2 นิ้ว", unit: "ม้วน" },
  { id: 15, name: "กระดาษกาวนิตโตะ ขนาด 3 นิ้ว", unit: "ม้วน" },
  { id: 16, name: "เทปผ้า ขนาด 2 นิ้ว", unit: "ม้วน" },
  { id: 17, name: "คลิปดำ 108 / กล่องละ 12 ตัว", unit: "กล่อง" },
  { id: 18, name: "คลิปดำ 109 / กล่องละ 12 ตัว", unit: "กล่อง" },
  { id: 19, name: "คลิปดำ 110 / กล่องละ 12 ตัว", unit: "กล่อง" },
  { id: 20, name: "คลิปดำ 111 / กล่องละ 12 ตัว", unit: "กล่อง" },
  { id: 21, name: "คลิปดำ 112 / กล่องละ 12 ตัว", unit: "กล่อง" },
  { id: 22, name: "เครื่องเจาะกระดาษ", unit: "ตัว" },
  { id: 23, name: "เครื่องเจาะกระดาษ (กลาง)", unit: "ตัว" },
  { id: 24, name: "เครื่องเจาะกระดาษ (ใหญ่)", unit: "ตัว" },
  { id: 25, name: "เครื่องเย็บกระดาษ (Max) เบอร์ 10", unit: "ตัว" },
  { id: 26, name: "เครื่องเย็บกระดาษ (Max) เบอร์ 35", unit: "ตัว" },
  { id: 27, name: "เชือกผูกสำนวน", unit: "ม้วน" },
  { id: 28, name: "ซองทางราชการตราครุฑ แฟ้มละ 50 ซอง", unit: "แฟ้ม" },
  { id: 29, name: "ซองทางราชการตราครุฑ แฟ้มละ 50 ซอง", unit: "แฟ้ม" },
  { id: 30, name: "ซองน้ำตาล ขยาย 9x12", unit: "แฟ้ม" },
  { id: 31, name: "ซองน้ำตาล ขยาย 11x15", unit: "แฟ้ม" },
  { id: 32, name: "ซองน้ำตาลพับ A4 แฟ้มละ 50 ซอง", unit: "แฟ้ม" },
  { id: 33, name: "ซองน้ำตาลขยายข้างใหญ่ แฟ้มละ 50 ซอง", unit: "แฟ้ม" },
  { id: 34, name: "ดินสอดำ 2B", unit: "แท่ง" },
  { id: 35, name: "ตรายางวันที่", unit: "อัน" },
  { id: 36, name: "ทะเบียนหนังสือรับ", unit: "เล่ม" },
  { id: 37, name: "ทะเบียนหนังสือส่ง", unit: "เล่ม" },
  { id: 38, name: "ด้ามตลับชาด สีแดง", unit: "ตลับ" },
  { id: 39, name: "ด้ามตลับชาด สีน้ำเงิน", unit: "ตลับ" },
  { id: 40, name: "แป้นสแตมป์ใส (เล็ก)", unit: "ตลับ" },
  { id: 41, name: "แป้นสแตมป์ใส (ใหญ่)", unit: "ตลับ" },
  { id: 42, name: "เทปใส (แกนเล็ก)", unit: "ม้วน" },
  { id: 43, name: "เทปใส (แกนใหญ่) ขนาดกว้าง 1 นิ้ว", unit: "ม้วน" },
  { id: 44, name: "เทปใส (แกนใหญ่) ขนาดกว้าง 0.5 นิ้ว", unit: "ม้วน" },
  { id: 45, name: "เทปผ้ากาว เลเซอร์ 5 mm", unit: "ม้วน" },
  { id: 46, name: "เทปผ้ากาว เลเซอร์ 9 mm", unit: "ม้วน" },
  { id: 47, name: "ที่ตัดลวด กรงนก", unit: "ตัว" },
  { id: 48, name: "ชานอ้อย ขนาด 120*225 ซม.", unit: "แผ่น" },
  { id: 49, name: "ชานอ้อย ขนาด 60*90 ซม.", unit: "แผ่น" },
  { id: 50, name: "น้ำยาลบคำผิด", unit: "อัน" },

  // --- คอลัมน์ที่ 2: ลำดับที่ 51 - 100 ---
  { id: 51, name: "ใบมีดคัตเตอร์ (เล็ก)", unit: "ใบ" },
  { id: 52, name: "ใบมีดคัตเตอร์ (ใหญ่)", unit: "ใบ" },
  { id: 53, name: "มีดคัตเตอร์ (ใหญ่)", unit: "อัน" },
  { id: 54, name: "มีดคัตเตอร์ (เล็ก)", unit: "อัน" },
  { id: 55, name: "ที่ถอนลวด (ก้ามปู) เบอร์ 10", unit: "อัน" },
  { id: 56, name: "ที่ถอนลวด กรงนก (ลายกิ๊บ)", unit: "ตัว" },
  { id: 57, name: "ปากกาหมึกเจล/ลูกลื่น สีน้ำเงิน", unit: "ด้าม" },
  { id: 58, name: "ปากกาหมึกเจล/ลูกลื่น สีแดง", unit: "ด้าม" },
  { id: 59, name: "ปากกาหมึกเจล/ลูกลื่น สีดำ", unit: "ด้าม" },
  { id: 60, name: "ปากกาเคมี", unit: "ด้าม" },
  { id: 61, name: "ปากกาดำ", unit: "ด้าม" },
  { id: 62, name: "ปากกาแดง", unit: "ด้าม" },
  { id: 63, name: "ปากกาน้ำเงิน", unit: "ด้าม" },
  { id: 64, name: "ปากกาน้ำเงิน (Gsoft) เขียนครุภัณฑ์", unit: "ด้าม" },
  { id: 65, name: "ผ้าหมึกพิมพ์ดีด แมนยู", unit: "ม้วน" },
  { id: 66, name: "ไม้บรรทัด พลาสติก", unit: "อัน" },
  { id: 67, name: "ไม้บรรทัด อลูมิเนียม", unit: "อัน" },
  { id: 68, name: "ยางลบดินสอ", unit: "ก้อน" },
  { id: 69, name: "ลวดเสียบกระดาษ No.10", unit: "กล่อง" },
  { id: 70, name: "ลวดเสียบกระดาษ No.35", unit: "กล่อง" },
  { id: 71, name: "ลวดเสียบกระดาษ", unit: "กล่อง" },
  { id: 72, name: "ลิ้นแฟ้ม", unit: "กล่อง" },
  { id: 73, name: "แฟ้มเสนอ", unit: "แฟ้ม" },
  { id: 74, name: "แฟ้มกระดาษ เจาะเปล่า A4", unit: "แฟ้ม" },
  { id: 75, name: "แฟ้มกระดาษ เจาะเปล่า F14", unit: "แฟ้ม" },
  { id: 76, name: "แฟ้มห่วงใสกระจาย", unit: "แฟ้ม" },
  { id: 77, name: "แฟ้มห่วงใสรีไซเคิล", unit: "แฟ้ม" },
  { id: 78, name: "แฟ้มสองหน้า", unit: "แฟ้ม" },
  { id: 79, name: "แฟ้มสอด F14", unit: "แฟ้ม" },
  { id: 80, name: "แฟ้มสันขอบ กว้าง 1.25 นิ้ว (2 นิ้ว)", unit: "แฟ้ม" },
  { id: 81, name: "แฟ้มสันขอบ กว้าง 1.25 นิ้ว (3 นิ้ว)", unit: "แฟ้ม" },
  { id: 82, name: "แฟ้มแขวนสารบัญต่างๆ", unit: "แฟ้ม" },
  { id: 83, name: "แฟ้มประวัติ กพ.7", unit: "แฟ้ม" },
  { id: 84, name: "แฟ้มสัน 500 F/C", unit: "แฟ้ม" },
  { id: 85, name: "สมุดเล่มเล็กเบอร์ 2", unit: "เล่ม" },
  { id: 86, name: "สมุดมุมผ้า 4/100 (เล็ก)", unit: "เล่ม" },
  { id: 87, name: "สมุดมุมผ้า 4/200 (ใหญ่)", unit: "เล่ม" },
  { id: 88, name: "สติกเกอร์ใส", unit: "ห่อ" },
  { id: 89, name: "สติกเกอร์ A4 รีม/แบบโฟโต้", unit: "ห่อ" },
  { id: 90, name: "กระดาษไข", unit: "ห่อ" },
  { id: 91, name: "หมึกเติมตลับชาด (สีน้ำเงิน)", unit: "ขวด" },
  { id: 92, name: "หมึกเติมตลับชาด (สีแดง)", unit: "ขวด" },
  { id: 93, name: "หมึกเติมตลับชาด (สีดำ)", unit: "ขวด" },
  { id: 94, name: "ปิ๊กเกอร์กล่อง 1 นิ้ว", unit: "กล่อง" },
  { id: 95, name: "ปิ๊กเกอร์กล่อง 1.5 นิ้ว", unit: "กล่อง" },
  { id: 96, name: "ปิ๊กเกอร์กล่อง 2 นิ้ว", unit: "กล่อง" },
  { id: 97, name: "ปิ๊กเกอร์กล่อง 3 นิ้ว", unit: "กล่อง" },
  { id: 98, name: "ใบลายเสร็จ เก่าไม่ตัด", unit: "แผ่น" },
  { id: 99, name: "ใบลายเสร็จ เก่าตัด", unit: "แผ่น" },
  { id: 100, name: "ลวดหนีบ (แกนกว้าง 1 นิ้ว)", unit: "ม้วน" },

  // --- คอลัมน์ที่ 3: ลำดับที่ 101 - 143 ---
  { id: 101, name: "ลวดหนีบ (แกนกว้าง 2 นิ้ว)", unit: "ม้วน" },
  { id: 102, name: "ลวดหนีบ (แกนกว้าง 3 นิ้ว)", unit: "ม้วน" },
  { id: 103, name: "น้ำมันขาวทาโต๊ะ", unit: "อัน" },
  { id: 104, name: "ที่หนีบกระดาษ", unit: "ตลับ" },
  { id: 105, name: "หมึกเติมตรายางม้า (สีแดง)", unit: "ขวด" },
  { id: 106, name: "หมึกเติมตรายางม้า (สีดำ)", unit: "ขวด" },
  { id: 107, name: "หมึกเติมตรายางม้า (สีน้ำเงิน)", unit: "ขวด" },
  { id: 108, name: "ปากกาเน้นข้อความคละสี", unit: "ด้าม" },
  { id: 109, name: "ฟิล์มเครื่องถ่ายเอกสาร Brother", unit: "กล่อง" },
  { id: 110, name: "หมึกเครื่องถ่ายเอกสาร เคียวเซร่า", unit: "กล่อง" },
  { id: 111, name: "หมึกเครื่องโรเนียว", unit: "กล่อง" },
  { id: 112, name: "แผ่นดิสเก็ต", unit: "แผ่น" },
  { id: 113, name: "แผ่นซีดี", unit: "แผ่น" },
  { id: 114, name: "แผ่นดีวีดี", unit: "แผ่น" },
  { id: 115, name: "เมาส์", unit: "ตัว" },
  { id: 116, name: "คีย์บอร์ด", unit: "ตัว" },
  { id: 117, name: "ตลับหมึก HP Laser (12A)", unit: "กล่อง" },
  { id: 118, name: "ตลับหมึก HP Laser (35A)", unit: "กล่อง" },
  { id: 119, name: "ตลับหมึก HP Laser (78A)", unit: "กล่อง" },
  { id: 120, name: "ตลับหมึก HP Laser (83A)", unit: "กล่อง" },
  { id: 121, name: "ตลับหมึก HP Laser (85A)", unit: "กล่อง" },
  { id: 122, name: "ตลับหมึก HP Laser (05A)", unit: "กล่อง" },
  { id: 123, name: "ตลับหมึก Samsung Laser (104S)", unit: "กล่อง" },
  { id: 124, name: "หมึกเครื่องพิมพ์ Xerox 3422", unit: "กล่อง" },
  { id: 125, name: "หมึกเครื่องพิมพ์ Xerox 3435 D", unit: "กล่อง" },
  { id: 126, name: "หมึกเครื่องพิมพ์ Xerox P225 dw", unit: "กล่อง" },
  { id: 127, name: "หมึกเครื่องพิมพ์ Canon LBP 3050", unit: "กล่อง" },
  { id: 128, name: "หมึกเครื่องพิมพ์ Canon 312", unit: "กล่อง" },
  { id: 129, name: "หมึกเครื่องพิมพ์ Canon 325", unit: "กล่อง" },
  { id: 130, name: "หมึกเครื่องพิมพ์ Samsung 203 L", unit: "กล่อง" },
  { id: 131, name: "หมึกพิมพ์อิงค์เจ็ท Brother (ขวดเติม) ดำ", unit: "ขวด" },
  { id: 132, name: "หมึกพิมพ์อิงค์เจ็ท Brother (ขวดเติม) สีแดง", unit: "ขวด" },
  { id: 133, name: "หมึกพิมพ์อิงค์เจ็ท Brother (ขวดเติม) สีเหลือง", unit: "ขวด" },
  { id: 134, name: "หมึกพิมพ์อิงค์เจ็ท Brother (ขวดเติม) น้ำเงิน", unit: "ขวด" },
  { id: 135, name: "หมึกพิมพ์อิงค์เจ็ท Canon (ขวดเติม) ดำ", unit: "ขวด" },
  { id: 136, name: "หมึกพิมพ์อิงค์เจ็ท Canon (ขวดเติม) สีเหลือง", unit: "ขวด" },
  { id: 137, name: "หมึกพิมพ์อิงค์เจ็ท Canon (ขวดเติม) สีฟ้า", unit: "ขวด" },
  { id: 138, name: "หมึกพิมพ์อิงค์เจ็ท Canon (ขวดเติม) สีแดง", unit: "ขวด" },
  { id: 139, name: "ผ้าหมึกพิมพ์ EPSON LQ 2090 (แท้/ตลับ)", unit: "กล่อง" },
  { id: 140, name: "ผ้าหมึกพิมพ์ EPSON LQ 2090 (แทน/ตลับ)", unit: "กล่อง" },
  { id: 141, name: "ถ่านไฟฉาย A", unit: "โหล" },
  { id: 142, name: "ถ่านไฟฉาย AA", unit: "โหล" },
  { id: 143, name: "ถ่านไฟฉาย AAA", unit: "โหล" }
];

// สถานะการเบิกเก็บเป็น Object: { [id]: { req: number, disp: number } }
let requisitionData = {};
let filterOnlySelected = false;

// ================= INITIALIZATION =================
document.addEventListener("DOMContentLoaded", () => {
  initDateAndDocNo();
  renderAllTables();
  initEventListeners();
  loadSavedHeader();
  loadHistoryFromStorage();
});

function initDateAndDocNo() {
  const now = new Date();
  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const day = now.getDate();
  const month = thaiMonths[now.getMonth()];
  const year = now.getFullYear() + 543;
  
  const dateInput = document.getElementById("docDate");
  if (dateInput && !dateInput.value) {
    dateInput.value = `${day} ${month} ${year}`;
  }

  // สร้างเลขที่ใบเบิกอัตโนมัติ
  const yStr = now.getFullYear();
  const mStr = ("0" + (now.getMonth() + 1)).slice(-2);
  const docNoInput = document.getElementById("docNo");
  if (docNoInput) {
    docNoInput.value = `REQ-${yStr}${mStr}-0001`;
  }
}

// ================= RENDER 3 COLUMNS =================
function renderAllTables() {
  const col1Items = ITEMS_DATABASE.filter(i => i.id >= 1 && i.id <= 50);
  const col2Items = ITEMS_DATABASE.filter(i => i.id >= 51 && i.id <= 100);
  const col3Items = ITEMS_DATABASE.filter(i => i.id >= 101 && i.id <= 143);

  renderColumnTbody("tbodyCol1", col1Items);
  renderColumnTbody("tbodyCol2", col2Items);
  renderColumnTbody("tbodyCol3", col3Items);

  updateTotals();
}

function renderColumnTbody(tbodyId, items) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  tbody.innerHTML = items.map(item => {
    const data = requisitionData[item.id] || { req: "", disp: "" };
    const hasQty = (data.req !== "" && Number(data.req) > 0) || (data.disp !== "" && Number(data.disp) > 0);
    const rowClass = hasQty ? "has-qty" : "";

    return `
      <tr id="row-item-${item.id}" class="${rowClass}" data-id="${item.id}" data-name="${escapeHtml(item.name)}">
        <td class="td-no">${item.id}</td>
        <td class="td-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</td>
        <td class="col-head-req">
          <input type="number" 
                 class="cell-num-input input-req" 
                 min="0" 
                 step="1" 
                 value="${data.req}" 
                 oninput="handleReqQtyChange(${item.id}, this.value)"
                 onchange="handleReqQtyChange(${item.id}, this.value)">
        </td>
        <td class="td-unit">${escapeHtml(item.unit)}</td>
        <td class="col-head-disp">
          <input type="number" 
                 class="cell-num-input input-disp" 
                 min="0" 
                 step="1" 
                 value="${data.disp}" 
                 oninput="handleDispQtyChange(${item.id}, this.value)">
        </td>
      </tr>
    `;
  }).join("");
}

// ================= QUANTITY CHANGE HANDLERS =================
function handleReqQtyChange(itemId, value) {
  const numVal = value === "" ? "" : Math.max(0, parseInt(value, 10) || 0);

  if (!requisitionData[itemId]) {
    requisitionData[itemId] = { req: "", disp: "" };
  }
  requisitionData[itemId].req = numVal;

  // หากยังไม่เคยกำหนดจำนวนจ่าย ให้ตั้งจำนวนจ่ายเท่ากับจำนวนเบิกอัตโนมัติ
  const row = document.getElementById(`row-item-${itemId}`);
  if (row) {
    const dispInput = row.querySelector(".input-disp");
    if (dispInput && (dispInput.value === "" || dispInput.value === "0")) {
      dispInput.value = numVal;
      requisitionData[itemId].disp = numVal;
    }

    if (numVal > 0) {
      row.classList.add("has-qty");
    } else if (requisitionData[itemId].disp === "" || requisitionData[itemId].disp === 0) {
      row.classList.remove("has-qty");
    }
  }

  updateTotals();
}

function handleDispQtyChange(itemId, value) {
  const numVal = value === "" ? "" : Math.max(0, parseInt(value, 10) || 0);

  if (!requisitionData[itemId]) {
    requisitionData[itemId] = { req: "", disp: "" };
  }
  requisitionData[itemId].disp = numVal;

  const row = document.getElementById(`row-item-${itemId}`);
  if (row) {
    const reqVal = requisitionData[itemId].req;
    if (numVal > 0 || (reqVal !== "" && reqVal > 0)) {
      row.classList.add("has-qty");
    } else {
      row.classList.remove("has-qty");
    }
  }

  updateTotals();
}

function updateTotals() {
  let selectedCount = 0;
  let sumReq = 0;
  let sumDisp = 0;

  for (let id in requisitionData) {
    const itm = requisitionData[id];
    const r = parseInt(itm.req, 10) || 0;
    const d = parseInt(itm.disp, 10) || 0;
    if (r > 0 || d > 0) {
      selectedCount++;
      sumReq += r;
      sumDisp += d;
    }
  }

  document.getElementById("totalItemsSelected").textContent = selectedCount;
  document.getElementById("sumReqTop").textContent = sumReq.toLocaleString();
  document.getElementById("sumDispTop").textContent = sumDisp.toLocaleString();
}

// ================= TOOLBAR ACTIONS =================
function initEventListeners() {
  // 1. Quick Action: จ่าย = เบิก
  document.getElementById("btnQuickCopyQty").addEventListener("click", () => {
    let count = 0;
    for (let id in requisitionData) {
      const itm = requisitionData[id];
      if (itm.req !== "" && itm.req > 0) {
        itm.disp = itm.req;
        const row = document.getElementById(`row-item-${id}`);
        if (row) {
          row.querySelector(".input-disp").value = itm.req;
        }
        count++;
      }
    }
    updateTotals();
    showToast(`คัดลอกจำนวนจ่าย = เบิก เรียบร้อย (${count} รายการ)`, "success");
  });

  // 2. Filter: เฉพาะที่เบิก / แสดงทั้งหมด
  document.getElementById("btnFilterSelected").addEventListener("click", () => {
    filterOnlySelected = !filterOnlySelected;
    const btnText = document.getElementById("filterBtnText");
    btnText.textContent = filterOnlySelected ? "แสดงทั้งหมด" : "เฉพาะที่เบิก";

    document.querySelectorAll(".grid-table tbody tr").forEach(tr => {
      const id = tr.dataset.id;
      const data = requisitionData[id];
      const hasQty = data && ((data.req > 0) || (data.disp > 0));
      if (filterOnlySelected) {
        if (!hasQty) {
          tr.classList.add("is-hidden");
        } else {
          tr.classList.remove("is-hidden");
        }
      } else {
        tr.classList.remove("is-hidden");
      }
    });

    showToast(filterOnlySelected ? "กำลังแสดงเฉพาะรายการที่เบิก" : "แสดงรายการทั้งหมด 143 รายการ", "info");
  });

  // 3. Clear All
  document.getElementById("btnClearAll").addEventListener("click", () => {
    if (confirm("คุณต้องการล้างจำนวนพัสดุที่กรอกไว้ทั้งหมดใช่หรือไม่?")) {
      requisitionData = {};
      document.querySelectorAll(".cell-num-input").forEach(input => input.value = "");
      document.querySelectorAll(".grid-table tbody tr").forEach(tr => tr.classList.remove("has-qty"));
      updateTotals();
      showToast("ล้างข้อมูลเรียบร้อยแล้ว", "info");
    }
  });

  // 4. Quick Search
  document.getElementById("quickSearchInput").addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    document.querySelectorAll(".grid-table tbody tr").forEach(tr => {
      const name = (tr.dataset.name || "").toLowerCase();
      const id = tr.dataset.id;
      if (query && (name.includes(query) || id === query)) {
        tr.classList.add("search-match");
      } else {
        tr.classList.remove("search-match");
      }
    });

    // เลื่อนไปยังแถวแรกที่เจอ
    if (query) {
      const firstMatch = document.querySelector(".grid-table tbody tr.search-match");
      if (firstMatch) {
        firstMatch.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  });

  // 5. Print A4
  document.getElementById("btnPrintA4").addEventListener("click", () => {
    window.print();
  });

  // 6. Save to Google Sheets
  document.getElementById("btnSaveToSheets").addEventListener("click", handleSaveToGoogleSheets);

  // 7. Modals
  const historyModal = document.getElementById("historyModal");
  document.getElementById("btnOpenHistory").addEventListener("click", () => {
    renderHistoryModal();
    historyModal.classList.add("open");
  });
  document.getElementById("btnCloseHistory").addEventListener("click", () => historyModal.classList.remove("open"));

  const settingsModal = document.getElementById("settingsModal");
  document.getElementById("btnOpenSettings").addEventListener("click", () => {
    document.getElementById("settingWebAppUrl").value = localStorage.getItem(STORAGE_KEYS.WEB_APP_URL) || DEFAULT_WEB_APP_URL;
    settingsModal.classList.add("open");
  });
  document.getElementById("btnCloseSettings").addEventListener("click", () => settingsModal.classList.remove("open"));
  document.getElementById("btnSaveSettings").addEventListener("click", () => {
    const url = document.getElementById("settingWebAppUrl").value.trim();
    localStorage.setItem(STORAGE_KEYS.WEB_APP_URL, url);
    settingsModal.classList.remove("open");
    showToast("บันทึกการตั้งค่าแล้ว", "success");
  });
  document.getElementById("btnTestConnection").addEventListener("click", testConnection);

  // Sync Requester Name with Signature Name 1
  document.getElementById("requesterName").addEventListener("input", (e) => {
    document.getElementById("sigName1").value = e.target.value;
  });
}

// ================= SAVE TO GOOGLE SHEETS =================
async function handleSaveToGoogleSheets() {
  saveHeaderToStorage();

  const selectedItems = [];
  let totalReq = 0;
  let totalDisp = 0;

  for (let id in requisitionData) {
    const itm = requisitionData[id];
    const r = parseInt(itm.req, 10) || 0;
    const d = parseInt(itm.disp, 10) || 0;
    if (r > 0 || d > 0) {
      const baseItem = ITEMS_DATABASE.find(i => i.id == id);
      selectedItems.push({
        id: baseItem ? baseItem.id : id,
        name: baseItem ? baseItem.name : `พัสดุลำดับที่ ${id}`,
        unit: baseItem ? baseItem.unit : "ชิ้น",
        requestedQty: r,
        dispensedQty: d
      });
      totalReq += r;
      totalDisp += d;
    }
  }

  if (selectedItems.length === 0) {
    showToast("กรุณาระบุจำนวนที่ต้องการเบิกอย่างน้อย 1 รายการ", "warning");
    return;
  }

  const payload = {
    docNo: document.getElementById("docNo").value.trim(),
    date: document.getElementById("docDate").value.trim(),
    org: document.getElementById("docOrg").value.trim(),
    requester: document.getElementById("requesterName").value.trim(),
    department: document.getElementById("department").value.trim(),
    approver: document.getElementById("sigName2").value.trim(),
    dispenser: document.getElementById("sigName3").value.trim(),
    itemCount: selectedItems.length,
    totalRequested: totalReq,
    totalDispensed: totalDisp,
    items: selectedItems,
    allQuantities: requisitionData // เก็บ snapshot ทั้งหมดสำหรับโหลดพิมพ์ซ้ำ
  };

  const btn = document.getElementById("btnSaveToSheets");
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> บันทึก...`;

  const webAppUrl = localStorage.getItem(STORAGE_KEYS.WEB_APP_URL) || DEFAULT_WEB_APP_URL;

  try {
    if (webAppUrl) {
      await fetch(webAppUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "createRequisition",
          data: payload
        })
      });
    }

    saveRequisitionHistory(payload);
    showToast(`บันทึกใบเบิก ${payload.docNo} ลงฐานข้อมูลเรียบร้อยแล้ว!`, "success");

    // เพิ่มเลขที่ใบเบิกถัดไปอัตโนมัติ
    incrementDocNo();

  } catch (err) {
    console.warn("API Error, saving offline:", err);
    saveRequisitionHistory(payload);
    showToast(`บันทึกในเครื่องเรียบร้อย (โหมดออฟไลน์)`, "success");
    incrementDocNo();
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> บันทึกชีต`;
  }
}

function incrementDocNo() {
  const docNoInput = document.getElementById("docNo");
  if (!docNoInput) return;
  const cur = docNoInput.value;
  const parts = cur.split("-");
  if (parts.length >= 3) {
    const nextNum = parseInt(parts[2], 10) + 1;
    docNoInput.value = `${parts[0]}-${parts[1]}-${("0000" + nextNum).slice(-4)}`;
  }
}

// ================= HISTORY MANAGEMENT =================
let historyCache = [];

function loadHistoryFromStorage() {
  try {
    historyCache = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUISITIONS) || "[]");
  } catch (e) {
    historyCache = [];
  }
}

function saveRequisitionHistory(payload) {
  historyCache.unshift(payload);
  localStorage.setItem(STORAGE_KEYS.REQUISITIONS, JSON.stringify(historyCache));
}

function renderHistoryModal() {
  const tbody = document.getElementById("historyModalTbody");
  if (!tbody) return;

  if (historyCache.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted" style="padding: 20px;">ไม่พบประวัติการบันทึก</td></tr>`;
    return;
  }

  tbody.innerHTML = historyCache.map((req, idx) => `
    <tr>
      <td class="font-mono font-bold">${escapeHtml(req.docNo)}</td>
      <td>${escapeHtml(req.date)}</td>
      <td>${escapeHtml(req.requester)}</td>
      <td>${escapeHtml(req.department)}</td>
      <td class="text-center">${req.itemCount}</td>
      <td class="text-center font-bold text-primary">${req.totalRequested}</td>
      <td class="text-center font-bold text-success">${req.totalDispensed}</td>
      <td class="text-center">
        <button type="button" class="btn btn-warning btn-sm" onclick="loadAndPrintHistory(${idx})">
          <i class="fa-solid fa-print"></i> โหลดพิมพ์
        </button>
      </td>
    </tr>
  `).join("");
}

function loadAndPrintHistory(index) {
  const req = historyCache[index];
  if (!req) return;

  document.getElementById("docNo").value = req.docNo || "";
  document.getElementById("docDate").value = req.date || "";
  document.getElementById("docOrg").value = req.org || "";
  document.getElementById("requesterName").value = req.requester || "";
  document.getElementById("department").value = req.department || "";
  document.getElementById("sigName1").value = req.requester || "";
  if (req.approver) document.getElementById("sigName2").value = req.approver;
  if (req.dispenser) document.getElementById("sigName3").value = req.dispenser;

  // คืนค่าจำนวนเบิก/จ่าย
  requisitionData = req.allQuantities || {};
  if (req.items && (!req.allQuantities || Object.keys(req.allQuantities).length === 0)) {
    requisitionData = {};
    req.items.forEach(itm => {
      requisitionData[itm.id] = { req: itm.requestedQty, disp: itm.dispensedQty };
    });
  }

  renderAllTables();
  document.getElementById("historyModal").classList.remove("open");
  showToast(`โหลดใบเบิก ${req.docNo} เรียบร้อย สั่งพิมพ์ได้ทันที`, "success");
}

// ================= STORAGE & CONNECTION =================
function saveHeaderToStorage() {
  const headerData = {
    org: document.getElementById("docOrg").value,
    requester: document.getElementById("requesterName").value,
    dept: document.getElementById("department").value,
    sig1: document.getElementById("sigName1").value,
    pos1: document.getElementById("sigPos1").value,
    sig2: document.getElementById("sigName2").value,
    pos2: document.getElementById("sigPos2").value,
    sig3: document.getElementById("sigName3").value,
    pos3: document.getElementById("sigPos3").value
  };
  localStorage.setItem(STORAGE_KEYS.FORM_HEADER, JSON.stringify(headerData));
}

function loadSavedHeader() {
  const saved = localStorage.getItem(STORAGE_KEYS.FORM_HEADER);
  if (!saved) return;
  try {
    const d = JSON.parse(saved);
    if (d.org) document.getElementById("docOrg").value = d.org;
    if (d.requester) document.getElementById("requesterName").value = d.requester;
    if (d.dept) document.getElementById("department").value = d.dept;
    if (d.sig1) document.getElementById("sigName1").value = d.sig1;
    if (d.pos1) document.getElementById("sigPos1").value = d.pos1;
    if (d.sig2) document.getElementById("sigName2").value = d.sig2;
    if (d.pos2) document.getElementById("sigPos2").value = d.pos2;
    if (d.sig3) document.getElementById("sigName3").value = d.sig3;
    if (d.pos3) document.getElementById("sigPos3").value = d.pos3;
  } catch (e) {}
}

async function testConnection() {
  const url = document.getElementById("settingWebAppUrl").value.trim();
  if (!url) {
    showToast("กรุณาระบุ URL", "warning");
    return;
  }
  showToast("กำลังทดสอบการเชื่อมต่อ...", "info");
  try {
    const res = await fetch(`${url}?action=getInitData`);
    const data = await res.json();
    if (data.status === "success") {
      showToast(`เชื่อมต่อสำเร็จ! ชื่อสเปรดชีต: ${data.spreadsheetName}`, "success");
    } else {
      showToast(`เชื่อมต่อได้: ${data.message || 'พร้อมใช้งาน'}`, "info");
    }
  } catch (err) {
    showToast("ไม่สามารถเชื่อมต่อได้: ตรวจสอบสิทธิ์ Authorize ของ Apps Script", "error");
  }
}

// ================= TOASTS & UTILS =================
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  let icon = "fa-circle-info";
  if (type === "success") icon = "fa-circle-check";
  if (type === "warning") icon = "fa-triangle-exclamation";
  if (type === "error") icon = "fa-circle-xmark";

  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
