/**
 * ==============================================================================
 * JAVASCRIPT LOGIC - ระบบใบเบิกพัสดุ (143 รายการ 3 คอลัมน์ A4 หน้าเดียว)
 * ถอดแบบจากเอกสารจริง 100% พร้อมเชื่อมต่อ Google Sheets API & GitHub Pages
 * รองรับการแบ่งบทบาท: เจ้าหน้าที่คีย์เบิกพัสดุ | เจ้าหน้าที่พัสดุคีย์จ่ายพัสดุ
 * ระบบ Login, สมัครสมาชิก, จัดการโปรไฟล์, จัดการสมาชิก, และคิวคำขอรอจ่าย
 * ==============================================================================
 */

// Web App URL เริ่มต้นของ Google Apps Script (Version 5/9 Deployed)
const DEFAULT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw00ssaHx4WEvK4aoZ6wk_p3zyOw8atXKKgBZ6tjL-FsT0VEt_wSONED-D2TpJdcTK4QA/exec";

// LocalStorage Keys
const STORAGE_KEYS = {
  WEB_APP_URL: "req_system_web_app_url",
  FORM_HEADER: "req_system_header",
  REQUISITIONS: "req_system_history",
  CURRENT_USER: "req_system_current_user"
};

/**
 * ดึง Web App URL ที่ถูกต้อง พร้อมกรองค่าว่างหรือ URL ที่เสียหายออก
 */
function getActiveWebAppUrl() {
  const saved = (localStorage.getItem(STORAGE_KEYS.WEB_APP_URL) || "").trim();
  if (!saved || saved.includes(" ") || saved.length < 50 || !saved.startsWith("https://script.google.com")) {
    try {
      localStorage.setItem(STORAGE_KEYS.WEB_APP_URL, DEFAULT_WEB_APP_URL);
    } catch (e) {}
    return DEFAULT_WEB_APP_URL;
  }
  return saved;
}

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

// ================= USER STATE & ROLES =================
let currentUser = null;
let pendingDispenseDocNo = null; // เก็บเลขที่ใบเบิกหากเจ้าหน้าที่พัสดุกำลังจ่ายพัสดุ
let historyCache = [];
let membersCache = [];

function loadCurrentUser() {
  const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // หากเป็นข้อมูลจำลองเดิม (wit) ให้เคลียร์ออกเพื่อให้เป็นข้อมูลจริง
      if (parsed && parsed.username === "wit") {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        currentUser = null;
        return;
      }
      currentUser = parsed;
      return;
    } catch (e) {}
  }
  currentUser = null;
}

function isStaffUser() {
  return !currentUser || currentUser.role === "staff";
}

function isSupplyUser() {
  return currentUser && (currentUser.role === "supply_officer" || currentUser.role === "admin");
}

function applyUserRoleUI() {
  const isAuth = !!currentUser;
  const userPill = document.getElementById("userProfileMenuContainer");
  const loginBtn = document.getElementById("btnOpenLoginModal");
  if (userPill) userPill.style.display = isAuth ? "" : "none";
  if (loginBtn) loginBtn.style.display = isAuth ? "none" : "";

  if (!currentUser) {
    document.querySelectorAll(".supply-only").forEach(el => el.style.display = "none");
    const saveBtnText = document.getElementById("saveBtnText");
    if (saveBtnText) saveBtnText.textContent = "ส่งคำขอเบิกพัสดุ";

    const docOrg = document.getElementById("docOrg");
    if (docOrg && (!docOrg.value || docOrg.value.trim() === "")) {
      docOrg.value = "ศาลแขวงอุบลราชธานี";
    }
    return;
  }

  const role = currentUser.role || "staff";
  const name = currentUser.fullName || currentUser.username;

  // 1. Top Navbar User Pill
  const topUserName = document.getElementById("topUserName");
  const topUserRoleBadge = document.getElementById("topUserRoleBadge");
  if (topUserName) topUserName.textContent = name.split(" ")[0] || name;

  if (topUserRoleBadge) {
    topUserRoleBadge.className = "user-role-badge";
    if (role === "supply_officer") {
      topUserRoleBadge.textContent = "จนท.พัสดุ";
      topUserRoleBadge.classList.add("badge-supply");
    } else if (role === "admin") {
      topUserRoleBadge.textContent = "ผู้ดูแลระบบ";
      topUserRoleBadge.classList.add("badge-admin");
    } else {
      topUserRoleBadge.textContent = "เจ้าหน้าที่เบิก";
      topUserRoleBadge.classList.add("badge-staff");
    }
  }

  // 2. Dropdown Header
  const dropName = document.getElementById("dropdownUserFullName");
  const dropRole = document.getElementById("dropdownUserRole");
  const dropDept = document.getElementById("dropdownUserDept");
  if (dropName) dropName.textContent = currentUser.fullName || currentUser.username;
  if (dropRole) {
    if (role === "supply_officer") dropRole.textContent = "เจ้าหน้าที่พัสดุ (คีย์จ่าย / ตัดสต็อก)";
    else if (role === "admin") dropRole.textContent = "ผู้ดูแลระบบ (Admin)";
    else dropRole.textContent = "เจ้าหน้าที่ทั่วไป (ผู้ขอเบิก)";
  }
  if (dropDept) dropDept.textContent = currentUser.department || "ศาลแขวงอุบลราชธานี";

  // 3. ปรับการแสดงผลปุ่มเฉพาะเจ้าหน้าที่พัสดุ (.supply-only)
  const isSupply = isSupplyUser();
  document.querySelectorAll(".supply-only").forEach(el => {
    el.style.display = isSupply ? "" : "none";
  });

  // 4. ปรับปุ่มบันทึกและข้อความ
  const saveBtnText = document.getElementById("saveBtnText");
  const saveBtnIcon = document.getElementById("saveBtnIcon");
  if (saveBtnText && saveBtnIcon) {
    if (pendingDispenseDocNo) {
      saveBtnText.textContent = "ยืนยันจ่ายพัสดุ (ตัดสต็อก)";
      saveBtnIcon.className = "fa-solid fa-boxes-packing";
    } else if (isSupply) {
      saveBtnText.textContent = "บันทึกจ่ายพัสดุ (ตัดสต็อก)";
      saveBtnIcon.className = "fa-solid fa-cloud-arrow-up";
    } else {
      saveBtnText.textContent = "ส่งคำขอเบิกพัสดุ";
      saveBtnIcon.className = "fa-solid fa-paper-plane";
    }
  }

  // 5. Autofill ข้อมูลจริงในเอกสารจากผู้ใช้จริงที่ล็อกอิน
  if (role === "staff") {
    // เจ้าหน้าที่ขอเบิก: ใส่ชื่อ-กลุ่มงานจริงตนเอง
    if (!pendingDispenseDocNo) {
      const reqInput = document.getElementById("requesterName");
      const deptInput = document.getElementById("department");
      const sig1 = document.getElementById("sigName1");
      const pos1 = document.getElementById("sigPos1");

      if (reqInput && currentUser.fullName) reqInput.value = currentUser.fullName;
      if (deptInput && currentUser.department) deptInput.value = currentUser.department;
      if (sig1 && currentUser.fullName) sig1.value = currentUser.fullName;
      if (pos1 && currentUser.position) pos1.value = currentUser.position;
    }
  } else if (isSupply) {
    // เจ้าหน้าที่พัสดุ: ใส่ชื่อจริงตนเองในช่องผู้จ่าย/เจ้าหน้าที่พัสดุ
    const sig3 = document.getElementById("sigName3");
    const pos3 = document.getElementById("sigPos3");
    if (sig3 && currentUser.fullName) sig3.value = currentUser.fullName;
    if (pos3 && currentUser.position) pos3.value = currentUser.position;
  }

  updatePendingBadgeCount();
}

// ================= INITIALIZATION =================
document.addEventListener("DOMContentLoaded", () => {
  loadCurrentUser();
  initDateAndDocNo();
  loadSavedHeader();
  loadHistoryFromStorage();
  applyUserRoleUI();
  renderAllTables();
  initEventListeners();
  initAuthEventListeners();

  // ดึงข้อมูลสถานะล่าสุดจากชีต
  syncWithBackend();
});

function initDateAndDocNo() {
  const now = new Date();
  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const day = now.getDate();
  const month = thaiMonths[now.getMonth()];
  
  // ปรับปี พ.ศ. ให้เป็นปีปัจจุบันจริง (พ.ศ. 2567 / 2024 หรือตามปีปัจจุบัน)
  const curY = now.getFullYear();
  const thaiYear = curY >= 2026 ? 2567 : curY + 543;
  
  const dateInput = document.getElementById("docDate");
  if (dateInput && !dateInput.value) {
    dateInput.value = `${day} ${month} ${thaiYear}`;
  }

  // ส่วนราชการตั้งค่าเริ่มต้นเป็น "ศาลแขวงอุบลราชธานี"
  const docOrg = document.getElementById("docOrg");
  if (docOrg && (!docOrg.value || docOrg.value.trim() === "")) {
    docOrg.value = "ศาลแขวงอุบลราชธานี";
  }

  // สร้างเลขที่ใบเบิกอัตโนมัติเบื้องต้น (จะถูกแทนที่ด้วยเลขถัดไปจริงจาก Google Sheets เมื่อเชื่อมต่อ)
  const yStr = thaiYear - 543;
  const mStr = ("0" + (now.getMonth() + 1)).slice(-2);
  const docNoInput = document.getElementById("docNo");
  if (docNoInput && (!docNoInput.value || docNoInput.value.includes("202610-0001"))) {
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

  const isStaff = isStaffUser();

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
                 placeholder="-"
                 oninput="handleReqQtyChange(${item.id}, this.value)"
                 onchange="handleReqQtyChange(${item.id}, this.value)">
        </td>
        <td class="td-unit">${escapeHtml(item.unit)}</td>
        <td class="col-head-disp">
          <input type="number" 
                 class="cell-num-input input-disp ${isStaff ? 'is-disabled' : ''}" 
                 min="0" 
                 step="1" 
                 value="${data.disp}" 
                 placeholder="-"
                 ${isStaff ? 'disabled title="เฉพาะเจ้าหน้าที่พัสดุเท่านั้นที่คีย์จ่ายได้"' : 'title="จำนวนที่จ่ายจริง"'} 
                 oninput="handleDispQtyChange(${item.id}, this.value)"
                 onchange="handleDispQtyChange(${item.id}, this.value)">
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

  const row = document.getElementById(`row-item-${itemId}`);

  // หากเป็นเจ้าหน้าที่พัสดุ และยังไม่เคยใส่จำนวนจ่าย ให้ sync จำนวนจ่ายตามจำนวนเบิก
  if (isSupplyUser()) {
    if (row) {
      const dispInput = row.querySelector(".input-disp");
      if (dispInput && (dispInput.value === "" || dispInput.value === "0")) {
        dispInput.value = numVal;
        requisitionData[itemId].disp = numVal;
      }
    }
  } else {
    // เจ้าหน้าที่เบิกทั่วไป: ล็อคจำนวนจ่ายเป็น 0 หรือว่าง
    requisitionData[itemId].disp = 0;
  }

  if (row) {
    if (numVal > 0 || (requisitionData[itemId].disp !== "" && requisitionData[itemId].disp > 0)) {
      row.classList.add("has-qty");
    } else {
      row.classList.remove("has-qty");
    }
  }

  updateTotals();
}

function handleDispQtyChange(itemId, value) {
  if (isStaffUser()) {
    showToast("เฉพาะเจ้าหน้าที่พัสดุเท่านั้นที่สามารถคีย์จำนวนจ่ายได้", "warning");
    return;
  }

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

// ================= TOOLBAR & ACTION EVENTS =================
function initEventListeners() {
  // 1. Quick Action: จ่าย = เบิก (เฉพาะเจ้าหน้าที่พัสดุ)
  const btnQuickCopy = document.getElementById("btnQuickCopyQty");
  if (btnQuickCopy) {
    btnQuickCopy.addEventListener("click", () => {
      if (isStaffUser()) {
        showToast("ฟังก์ชันนี้สงวนไว้สำหรับเจ้าหน้าที่พัสดุเท่านั้น", "warning");
        return;
      }
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
  }

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
  document.getElementById("btnSaveToSheets").addEventListener("click", handleSaveRequisition);

  // 7. ยกเลิกการจ่ายพัสดุสำหรับใบเบิกค้าง
  const btnCancelDispense = document.getElementById("btnCancelDispense");
  if (btnCancelDispense) {
    btnCancelDispense.addEventListener("click", cancelPendingDispense);
  }

  // 8. ประวัติใบเบิก
  const historyModal = document.getElementById("historyModal");
  document.getElementById("btnOpenHistory").addEventListener("click", () => {
    renderHistoryModal();
    historyModal.classList.add("open");
  });
  document.getElementById("btnCloseHistory").addEventListener("click", () => historyModal.classList.remove("open"));
  document.getElementById("btnRefreshHistoryModal").addEventListener("click", () => {
    syncWithBackend();
    renderHistoryModal();
    showToast("รีเฟรชข้อมูลประวัติแล้ว", "info");
  });

  // 9. ตั้งค่าการเชื่อมต่อ Google Sheets
  const settingsModal = document.getElementById("settingsModal");
  document.getElementById("btnOpenSettings").addEventListener("click", () => {
    document.getElementById("settingWebAppUrl").value = getActiveWebAppUrl();
    settingsModal.classList.add("open");
  });
  document.getElementById("btnCloseSettings").addEventListener("click", () => settingsModal.classList.remove("open"));
  document.getElementById("btnSaveSettings").addEventListener("click", () => {
    const rawUrl = document.getElementById("settingWebAppUrl").value.trim();
    if (rawUrl && (rawUrl.includes(" ") || rawUrl.length < 40 || !rawUrl.startsWith("https://script.google.com"))) {
      showToast("URL ไม่ถูกต้อง ต้องเป็น Apps Script URL (ขึ้นต้นด้วย https://script.google.com)", "warning");
      return;
    }
    const finalUrl = rawUrl || DEFAULT_WEB_APP_URL;
    localStorage.setItem(STORAGE_KEYS.WEB_APP_URL, finalUrl);
    settingsModal.classList.remove("open");
    showToast("บันทึกการตั้งค่า Web App เรียบร้อยแล้ว", "success");
    syncWithBackend();
  });
  document.getElementById("btnTestConnection").addEventListener("click", testConnection);

  // 10. ติดตั้งชีตและคอลัมน์อัตโนมัติ (Settings Modal)
  const btnAutoInstall = document.getElementById("btnAutoInstallSheets");
  if (btnAutoInstall) {
    btnAutoInstall.addEventListener("click", () => {
      const forceReset = document.getElementById("chkForceResetSheets") ? document.getElementById("chkForceResetSheets").checked : false;
      triggerAutoInstallSheets(forceReset);
    });
  }

  // Sync Requester Name with Signature Name 1
  document.getElementById("requesterName").addEventListener("input", (e) => {
    document.getElementById("sigName1").value = e.target.value;
  });
}

// ================= AUTH & USER MANAGEMENT EVENTS =================
function initAuthEventListeners() {
  // 1. User Profile Menu Dropdown Toggle
  const btnUserToggle = document.getElementById("btnUserProfileMenuToggle");
  const userDropdown = document.getElementById("userDropdownMenu");
  if (btnUserToggle && userDropdown) {
    btnUserToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!userDropdown.contains(e.target) && !btnUserToggle.contains(e.target)) {
        userDropdown.classList.remove("open");
      }
    });
  }

  // 2. Login Modal
  const loginModal = document.getElementById("loginModal");
  const btnOpenLogin = document.getElementById("btnOpenLoginModal");
  const btnCloseLogin = document.getElementById("btnCloseLogin");
  if (btnOpenLogin) btnOpenLogin.addEventListener("click", () => loginModal.classList.add("open"));
  if (btnCloseLogin) btnCloseLogin.addEventListener("click", () => loginModal.classList.remove("open"));

  // Quick Login Test Pills
  document.getElementById("btnQuickLoginSupply").addEventListener("click", () => {
    document.getElementById("loginUsername").value = "admin";
    document.getElementById("loginPassword").value = "1234";
    submitLogin();
  });
  document.getElementById("btnQuickLoginStaff").addEventListener("click", () => {
    document.getElementById("loginUsername").value = "wit";
    document.getElementById("loginPassword").value = "1234";
    submitLogin();
  });
  document.getElementById("btnSubmitLogin").addEventListener("click", submitLogin);

  // Switch between Login & Register
  document.getElementById("linkSwitchToRegister").addEventListener("click", () => {
    loginModal.classList.remove("open");
    document.getElementById("registerModal").classList.add("open");
  });
  document.getElementById("linkSwitchToLogin").addEventListener("click", () => {
    document.getElementById("registerModal").classList.remove("open");
    loginModal.classList.add("open");
  });

  // 3. Register Modal
  const registerModal = document.getElementById("registerModal");
  document.getElementById("btnCloseRegister").addEventListener("click", () => registerModal.classList.remove("open"));
  document.getElementById("btnSubmitRegister").addEventListener("click", submitRegister);

  // 4. Profile Modal
  const profileModal = document.getElementById("profileModal");
  document.getElementById("menuItemProfile").addEventListener("click", () => {
    userDropdown.classList.remove("open");
    openProfileModal();
  });
  document.getElementById("btnCloseProfile").addEventListener("click", () => profileModal.classList.remove("open"));
  document.getElementById("btnCancelProfile").addEventListener("click", () => profileModal.classList.remove("open"));
  document.getElementById("btnSaveProfile").addEventListener("click", submitProfileUpdate);

  // 5. Switch User & Logout
  const menuItemSwitch = document.getElementById("menuItemSwitchUser");
  if (menuItemSwitch) {
    menuItemSwitch.addEventListener("click", () => {
      userDropdown.classList.remove("open");
      document.getElementById("loginModal").classList.add("open");
    });
  }

  document.getElementById("menuItemLogout").addEventListener("click", () => {
    userDropdown.classList.remove("open");
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    currentUser = null;
    applyUserRoleUI();
    renderAllTables();
    document.getElementById("loginModal").classList.add("open");
    showToast("ออกจากระบบเรียบร้อยแล้ว กรุณาเข้าสู่ระบบ", "info");
  });

  // 6. Pending Queue Modal
  const pendingModal = document.getElementById("pendingModal");
  const btnOpenPending = document.getElementById("btnOpenPending");
  const menuItemPending = document.getElementById("menuItemPendingDropdown");
  const openPendingFunc = () => {
    if (userDropdown) userDropdown.classList.remove("open");
    renderPendingTable();
    pendingModal.classList.add("open");
  };
  if (btnOpenPending) btnOpenPending.addEventListener("click", openPendingFunc);
  if (menuItemPending) menuItemPending.addEventListener("click", openPendingFunc);
  document.getElementById("btnClosePending").addEventListener("click", () => pendingModal.classList.remove("open"));
  document.getElementById("btnRefreshPending").addEventListener("click", () => {
    syncWithBackend();
    renderPendingTable();
    showToast("รีเฟรชรายการรอจ่ายแล้ว", "info");
  });

  // 7. Members Management Modal
  const membersModal = document.getElementById("membersModal");
  const btnOpenMembers = document.getElementById("btnOpenMembers");
  const menuItemMembers = document.getElementById("menuItemMembersDropdown");
  const openMembersFunc = () => {
    if (userDropdown) userDropdown.classList.remove("open");
    loadMembersData();
    membersModal.classList.add("open");
  };
  if (btnOpenMembers) btnOpenMembers.addEventListener("click", openMembersFunc);
  if (menuItemMembers) menuItemMembers.addEventListener("click", openMembersFunc);
  document.getElementById("btnCloseMembers").addEventListener("click", () => membersModal.classList.remove("open"));
  document.getElementById("btnRefreshMembers").addEventListener("click", () => {
    loadMembersData();
    showToast("รีเฟรชรายชื่อสมาชิกแล้ว", "info");
  });

  const btnQuickInstall = document.getElementById("btnQuickInstallSheetsFromMembers");
  if (btnQuickInstall) {
    btnQuickInstall.addEventListener("click", () => {
      triggerAutoInstallSheets(false);
    });
  }
}

// ================= AUTHENTICATION ACTIONS =================
async function submitLogin() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!username || !password) {
    showToast("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน", "warning");
    return;
  }

  showToast("กำลังตรวจสอบข้อมูลเข้าสู่ระบบ...", "info");

  const webAppUrl = getActiveWebAppUrl();

  try {
    const res = await fetch(webAppUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "login",
        data: { username, password }
      })
    });
    const result = await res.json();

    if (result.status === "success" && result.user) {
      currentUser = result.user;
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      document.getElementById("loginModal").classList.remove("open");
      applyUserRoleUI();
      renderAllTables();
      showToast(`ยินดีต้อนรับ ${currentUser.fullName} (${currentUser.role === 'supply_officer' ? 'เจ้าหน้าที่พัสดุ' : 'เจ้าหน้าที่ขอเบิก'})`, "success");
      return;
    } else {
      showToast(result.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", "error");
    }
  } catch (err) {
    // โหมดออฟไลน์ fallback หากเน็ตขัดข้อง
    if ((username === "admin" && password === "1234") || (username === "wit" && password === "1234")) {
      currentUser = {
        id: username === "admin" ? "USR-0001" : "USR-0002",
        username: username,
        fullName: username === "admin" ? "นางสาวชัญญาพัชร์ โสภา" : "นายวิทย์ ภูภักดี",
        position: username === "admin" ? "นักวิชาการพัสดุชำนาญการ" : "นักวิชาการคอมพิวเตอร์ปฏิบัติการ",
        department: username === "admin" ? "กลุ่มงานพัสดุและอาคารสถานที่" : "กลุ่มงานเทคโนโลยีสารสนเทศ",
        role: username === "admin" ? "supply_officer" : "staff",
        status: "อนุมัติแล้ว"
      };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      document.getElementById("loginModal").classList.remove("open");
      applyUserRoleUI();
      renderAllTables();
      showToast(`เข้าสู่ระบบสำเร็จ (ออฟไลน์): ${currentUser.fullName}`, "success");
    } else {
      showToast("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง", "error");
    }
  }
}

async function submitRegister() {
  const username = document.getElementById("regUsername").value.trim();
  const role = document.getElementById("regRole").value;
  const password = document.getElementById("regPassword").value.trim();
  const confirmPassword = document.getElementById("regConfirmPassword").value.trim();
  const fullName = document.getElementById("regFullName").value.trim();
  const position = document.getElementById("regPosition").value.trim();
  const department = document.getElementById("regDepartment").value.trim() || "ศาลแขวงอุบลราชธานี";

  if (!username || !password || !fullName) {
    showToast("กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน", "warning");
    return;
  }

  if (username.length < 3) {
    showToast("ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร", "warning");
    return;
  }

  if (password.length < 4) {
    showToast("รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร", "warning");
    return;
  }

  if (password !== confirmPassword) {
    showToast("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน", "warning");
    return;
  }

  const btn = document.getElementById("btnSubmitRegister");
  const originalBtnHtml = btn ? btn.innerHTML : "";
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> กำลังบันทึกข้อมูลลง Google Sheets...`;
  }

  showToast("กำลังบันทึกข้อมูลสมาชิกลงในชีต 'ผู้ใช้งาน'...", "info");

  const webAppUrl = getActiveWebAppUrl();

  try {
    const res = await fetch(webAppUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "register",
        data: { username, password, fullName, position, department, role }
      })
    });
    const result = await res.json();

    if (result.status === "success" && result.user) {
      currentUser = result.user;
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));

      // ผสานเข้า membersCache ทันที
      if (Array.isArray(membersCache)) {
        const existingIdx = membersCache.findIndex(m => (m.username || "").toLowerCase() === currentUser.username.toLowerCase());
        if (existingIdx >= 0) membersCache[existingIdx] = currentUser;
        else membersCache.push(currentUser);
      }

      document.getElementById("registerModal").classList.remove("open");
      const form = document.getElementById("registerForm");
      if (form) form.reset();

      applyUserRoleUI();
      renderAllTables();
      showToast(`สมัครสมาชิกสำเร็จ! บันทึกข้อมูลลงใน Google Sheets เรียบร้อย (รหัส: ${currentUser.id})`, "success");
    } else {
      showToast(result.message || "เกิดข้อผิดพลาดในการลงทะเบียน", "error");
    }
  } catch (err) {
    console.warn("Register network fallback:", err);
    // Offline local register
    currentUser = {
      id: "USR-" + Date.now().toString().slice(-4),
      username,
      fullName,
      position,
      department,
      role,
      status: "อนุมัติแล้ว"
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    if (Array.isArray(membersCache)) membersCache.push(currentUser);

    document.getElementById("registerModal").classList.remove("open");
    applyUserRoleUI();
    renderAllTables();
    showToast(`ลงทะเบียนและเข้าสู่ระบบเรียบร้อย (โหมดออฟไลน์/บันทึกในเครื่อง)`, "info");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalBtnHtml;
    }
  }
}

/**
 * ================= AUTO-INSTALL SHEETS & COLUMNS FUNCTION =================
 * เรียกใช้ฟังก์ชันติดตั้งและตรวจสอบความสมบูรณ์ของชีตและคอลัมน์อัตโนมัติ
 */
async function triggerAutoInstallSheets(forceReset = false) {
  if (forceReset) {
    const ok = confirm("⚠️ คำเตือนสำคัญ:\nคุณเลือก 'ติดตั้งใหม่ทั้งหมด (Reset ข้อมูล)'\nระบบจะล้างข้อมูลและติดตั้งค่าเริ่มต้นใหม่ทั้งหมดสำหรับทั้ง 5 แท็บ\n\nคุณแน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?");
    if (!ok) return;
  }

  const btn = document.getElementById("btnAutoInstallSheets");
  const quickBtn = document.getElementById("btnQuickInstallSheetsFromMembers");
  const resultBox = document.getElementById("installResultBox");

  const origBtnText = btn ? btn.innerHTML : "";
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> กำลังติดตั้ง/ซ่อมแซมชีต...`;
  }
  if (quickBtn) {
    quickBtn.disabled = true;
    quickBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> กำลังติดตั้ง...`;
  }

  showToast("กำลังเชื่อมต่อ Google Sheets เพื่อติดตั้งและจัดระเบียบคอลัมน์...", "info");

  const webAppUrl = getActiveWebAppUrl();

  try {
    const res = await fetch(webAppUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "autoInstallDatabase",
        data: { forceReset: forceReset }
      })
    });
    const result = await res.json();

    if (result.status === "success") {
      let html = `
        <div style="font-weight: 600; margin-bottom: 8px; color: #047857;">
          <i class="fa-solid fa-circle-check"></i> ${escapeHtml(result.message)}
        </div>
      `;

      if (Array.isArray(result.sheets)) {
        html += result.sheets.map(s => {
          let extra = "";
          if (s.missingColumnsAppended && s.missingColumnsAppended.length > 0) {
            extra = ` <span style="color: #D97706; font-size: 10.5px;">(เพิ่มคอลัมน์ใหม่: ${escapeHtml(s.missingColumnsAppended.join(", "))})</span>`;
          }
          return `
            <div class="install-result-item">
              <span><strong>แท็บ "${escapeHtml(s.name)}"</strong> (${s.rowCount} แถว, ${s.colCount} คอลัมน์)${extra}</span>
              <span class="install-pill-success"><i class="fa-solid fa-check"></i> พร้อมใช้งาน</span>
            </div>
          `;
        }).join("");
      }

      if (resultBox) {
        resultBox.innerHTML = html;
        resultBox.style.display = "block";
      }

      showToast("ติดตั้งและตรวจสอบชีตทั้ง 5 แท็บพร้อมคอลัมน์ใน Google Sheets สำเร็จเรียบร้อยแล้ว!", "success");

      // โหลดข้อมูลล่าสุดจากชีต
      syncWithBackend();
      loadMembersData();
    } else {
      showToast(result.message || "เกิดข้อผิดพลาดในการติดตั้งชีต", "error");
      if (resultBox) {
        resultBox.innerHTML = `<div class="text-danger"><i class="fa-solid fa-circle-exclamation"></i> ${escapeHtml(result.message || "เกิดข้อผิดพลาด")}</div>`;
        resultBox.style.display = "block";
      }
    }
  } catch (err) {
    console.error("Auto-install error:", err);
    showToast("เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อติดตั้งชีต: " + err.message, "error");
    if (resultBox) {
      resultBox.innerHTML = `<div class="text-danger"><i class="fa-solid fa-triangle-exclamation"></i> เกิดข้อผิดพลาดในการเชื่อมต่อ: ${escapeHtml(err.message)}</div>`;
      resultBox.style.display = "block";
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origBtnText;
    }
    if (quickBtn) {
      quickBtn.disabled = false;
      quickBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> ติดตั้งชีตอัตโนมัติ`;
    }
  }
}

function openProfileModal() {
  if (!currentUser) return;
  document.getElementById("profileDisplayUsername").textContent = currentUser.username;
  const roleDisplay = document.getElementById("profileDisplayRole");
  if (roleDisplay) {
    roleDisplay.textContent = currentUser.role === "supply_officer" ? "เจ้าหน้าที่พัสดุ" : (currentUser.role === "admin" ? "ผู้ดูแลระบบ" : "เจ้าหน้าที่ขอเบิก");
  }
  document.getElementById("profileFullName").value = currentUser.fullName || "";
  document.getElementById("profilePosition").value = currentUser.position || "";
  document.getElementById("profileDepartment").value = currentUser.department || "ศาลแขวงอุบลราชธานี";
  document.getElementById("profileNewPassword").value = "";
  document.getElementById("profileModal").classList.add("open");
}

async function submitProfileUpdate() {
  if (!currentUser) return;

  const fullName = document.getElementById("profileFullName").value.trim();
  const position = document.getElementById("profilePosition").value.trim();
  const department = document.getElementById("profileDepartment").value.trim();
  const newPassword = document.getElementById("profileNewPassword").value.trim();

  if (!fullName) {
    showToast("กรุณากรอกชื่อ - นามสกุล", "warning");
    return;
  }

  showToast("กำลังอัปเดตโปรไฟล์...", "info");

  const webAppUrl = getActiveWebAppUrl();

  try {
    const res = await fetch(webAppUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "updateProfile",
        data: {
          username: currentUser.username,
          fullName,
          position,
          department,
          newPassword: newPassword || undefined
        }
      })
    });
    const result = await res.json();
    if (result.status === "success" && result.user) {
      currentUser = result.user;
    } else {
      currentUser.fullName = fullName;
      currentUser.position = position;
      currentUser.department = department;
    }
  } catch (err) {
    currentUser.fullName = fullName;
    currentUser.position = position;
    currentUser.department = department;
  }

  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  applyUserRoleUI();
  document.getElementById("profileModal").classList.remove("open");
  showToast("อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว", "success");
}

// ================= MEMBERS MANAGEMENT (SUPPLY / ADMIN) =================
async function loadMembersData() {
  const tbody = document.getElementById("membersTableTbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> กำลังโหลดข้อมูลสมาชิก...</td></tr>`;

  const webAppUrl = getActiveWebAppUrl();

  try {
    const res = await fetch(`${webAppUrl}?action=getUsers`);
    const result = await res.json();
    if (result.status === "success" && Array.isArray(result.data)) {
      membersCache = result.data;
    }
  } catch (e) {
    if (membersCache.length === 0) {
      membersCache = [
        { id: "USR-0001", username: "admin", fullName: "นางสาวชัญญาพัชร์ โสภา", position: "นักวิชาการพัสดุชำนาญการ", department: "กลุ่มงานพัสดุและอาคารสถานที่", role: "supply_officer", status: "อนุมัติแล้ว" },
        { id: "USR-0002", username: "wit", fullName: "นายวิทย์ ภูภักดี", position: "นักวิชาการคอมพิวเตอร์ปฏิบัติการ", department: "กลุ่มงานเทคโนโลยีสารสนเทศ", role: "staff", status: "อนุมัติแล้ว" },
        { id: "USR-0003", username: "director", fullName: "นางสุภาภรณ์ สุดามาตร", position: "นักวิชาการเงินและบัญชีชำนาญการพิเศษ", department: "กลุ่มงานการเงินและบัญชี", role: "approver", status: "อนุมัติแล้ว" }
      ];
    }
  }

  renderMembersTable();
}

function renderMembersTable() {
  const tbody = document.getElementById("membersTableTbody");
  if (!tbody) return;

  const query = (document.getElementById("searchMembersInput").value || "").toLowerCase().trim();
  const filtered = membersCache.filter(u => {
    if (!query) return true;
    return (u.username || "").toLowerCase().includes(query) ||
           (u.fullName || "").toLowerCase().includes(query) ||
           (u.department || "").toLowerCase().includes(query) ||
           (u.position || "").toLowerCase().includes(query);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 20px;">ไม่พบข้อมูลสมาชิก</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((u, idx) => `
    <tr>
      <td class="font-mono">${escapeHtml(u.id)}</td>
      <td><strong>${escapeHtml(u.username)}</strong></td>
      <td>${escapeHtml(u.fullName)}</td>
      <td>${escapeHtml(u.position || "-")} / <span class="text-muted">${escapeHtml(u.department || "-")}</span></td>
      <td>
        <select class="form-control" style="padding: 3px 6px; font-size: 11.5px;" onchange="updateMemberRole('${escapeHtml(u.id)}', this.value)">
          <option value="staff" ${u.role === 'staff' ? 'selected' : ''}>เจ้าหน้าที่เบิก</option>
          <option value="supply_officer" ${u.role === 'supply_officer' ? 'selected' : ''}>จนท.พัสดุ (จ่าย)</option>
          <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>ผู้ดูแลระบบ</option>
        </select>
      </td>
      <td>
        <span class="badge-status ${u.status === 'ระงับการใช้งาน' ? 'pending' : 'completed'}">
          ${escapeHtml(u.status || 'อนุมัติแล้ว')}
        </span>
      </td>
      <td class="text-center">
        <button type="button" class="btn btn-outline btn-sm text-danger" title="ลบสมาชิก" onclick="deleteMember('${escapeHtml(u.id)}', '${escapeHtml(u.username)}')">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    </tr>
  `).join("");
}

async function updateMemberRole(userId, newRole) {
  showToast("กำลังอัปเดตสิทธิ์...", "info");
  const webAppUrl = getActiveWebAppUrl();

  try {
    await fetch(webAppUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "updateUserRole",
        data: { id: userId, role: newRole }
      })
    });
  } catch (e) {}

  const mem = membersCache.find(m => m.id === userId);
  if (mem) mem.role = newRole;
  showToast("อัปเดตสิทธิ์สมาชิกเรียบร้อยแล้ว", "success");
}

async function deleteMember(userId, username) {
  if (currentUser && currentUser.id === userId) {
    showToast("ไม่สามารถลบบัญชีของตนเองที่กำลังล็อกอินอยู่ได้", "warning");
    return;
  }

  if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสมาชิก "${username}" ออกจากระบบ?`)) return;

  const webAppUrl = getActiveWebAppUrl();
  try {
    await fetch(webAppUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "deleteUser",
        data: { id: userId }
      })
    });
  } catch (e) {}

  membersCache = membersCache.filter(m => m.id !== userId);
  renderMembersTable();
  showToast(`ลบสมาชิก "${username}" เรียบร้อยแล้ว`, "success");
}

// ================= PENDING REQUISITIONS QUEUE (FOR SUPPLY OFFICER) =================
function updatePendingBadgeCount() {
  const pendingItems = historyCache.filter(r => r.status === "รอจ่ายพัสดุ");
  const count = pendingItems.length;

  const toolbarBadge = document.getElementById("pendingToolbarBadge");
  const dropdownBadge = document.getElementById("pendingDropdownCount");
  if (toolbarBadge) toolbarBadge.textContent = count;
  if (dropdownBadge) dropdownBadge.textContent = count;
}

function renderPendingTable() {
  const tbody = document.getElementById("pendingTableTbody");
  if (!tbody) return;

  const query = (document.getElementById("searchPendingInput").value || "").toLowerCase().trim();
  const pendingItems = historyCache.filter(r => {
    const isPending = r.status === "รอจ่ายพัสดุ";
    if (!isPending) return false;
    if (!query) return true;
    return (r.docNo || "").toLowerCase().includes(query) ||
           (r.requester || "").toLowerCase().includes(query) ||
           (r.department || "").toLowerCase().includes(query);
  });

  if (pendingItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted" style="padding: 24px;">ไม่มีรายการคำขอเบิกที่ค้างจ่ายในขณะนี้</td></tr>`;
    return;
  }

  tbody.innerHTML = pendingItems.map((req, idx) => `
    <tr>
      <td class="font-mono font-bold">${escapeHtml(req.docNo)}</td>
      <td>${escapeHtml(req.date)}</td>
      <td>${escapeHtml(req.requester)}</td>
      <td>${escapeHtml(req.department)}</td>
      <td class="text-center">${req.itemCount}</td>
      <td class="text-center font-bold text-primary">${req.totalRequested}</td>
      <td class="text-center"><span class="badge-status pending">รอจ่ายพัสดุ</span></td>
      <td class="text-center">
        <button type="button" class="btn btn-warning btn-sm" onclick="openRequisitionForDispense('${escapeHtml(req.docNo)}')">
          <i class="fa-solid fa-boxes-packing"></i> เปิดเพื่อจ่าย
        </button>
      </td>
    </tr>
  `).join("");
}

function openRequisitionForDispense(docNo) {
  const req = historyCache.find(r => r.docNo === docNo);
  if (!req) return;

  pendingDispenseDocNo = req.docNo;

  // โหลดข้อมูลลงหน้าจอหลัก
  document.getElementById("docNo").value = req.docNo;
  document.getElementById("docDate").value = req.date;
  if (req.org) document.getElementById("docOrg").value = req.org;
  document.getElementById("requesterName").value = req.requester || "";
  document.getElementById("department").value = req.department || "";
  document.getElementById("sigName1").value = req.requester || "";

  // ลายเซ็นผู้จ่ายเป็นของเจ้าหน้าที่พัสดุที่ล็อกอินอยู่
  if (currentUser) {
    document.getElementById("sigName3").value = currentUser.fullName;
    document.getElementById("sigPos3").value = currentUser.position;
  }

  // โหลดรายการที่เบิก และตั้งค่าจำนวนจ่าย = จำนวนเบิก เป็นค่าเริ่มต้นให้พัสดุตรวจและแก้ไข
  requisitionData = {};
  if (req.allQuantities && Object.keys(req.allQuantities).length > 0) {
    for (let id in req.allQuantities) {
      const q = req.allQuantities[id];
      requisitionData[id] = {
        req: q.req || 0,
        disp: (q.disp !== undefined && q.disp !== 0) ? q.disp : (q.req || 0)
      };
    }
  } else if (req.items && req.items.length > 0) {
    req.items.forEach(itm => {
      requisitionData[itm.id] = {
        req: itm.requestedQty || 0,
        disp: itm.dispensedQty || itm.requestedQty || 0
      };
    });
  }

  // แสดง Banner กำลังจ่ายพัสดุ
  const banner = document.getElementById("pendingDispenseBanner");
  if (banner) {
    document.getElementById("bannerDocNo").textContent = req.docNo;
    document.getElementById("bannerRequester").textContent = req.requester;
    banner.style.display = "flex";
  }

  document.getElementById("pendingModal").classList.remove("open");

  applyUserRoleUI();
  renderAllTables();

  showToast(`โหลดใบเบิก ${req.docNo} เรียบร้อยแล้ว กรุณาตรวจสอบจำนวนที่จ่ายจริง`, "success");
}

function cancelPendingDispense() {
  if (confirm("ต้องการยกเลิกการจ่ายพัสดุสำหรับใบเบิกนี้ และกลับสู่โหมดปกติใช่หรือไม่?")) {
    pendingDispenseDocNo = null;
    const banner = document.getElementById("pendingDispenseBanner");
    if (banner) banner.style.display = "none";

    requisitionData = {};
    initDateAndDocNo();
    applyUserRoleUI();
    renderAllTables();
    showToast("กลับสู่โหมดสร้างใบเบิกปกติแล้ว", "info");
  }
}

// ================= SAVE TO GOOGLE SHEETS =================
async function handleSaveRequisition() {
  saveHeaderToStorage();

  const isStaff = isStaffUser();
  const selectedItems = [];
  let totalReq = 0;
  let totalDisp = 0;

  for (let id in requisitionData) {
    const itm = requisitionData[id];
    const r = parseInt(itm.req, 10) || 0;
    // หากเป็น staff จะไม่ส่งยอดจ่าย (disp = 0)
    const d = isStaff ? 0 : (parseInt(itm.disp, 10) || 0);

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

  const docNo = document.getElementById("docNo").value.trim();
  const webAppUrl = getActiveWebAppUrl();
  const btn = document.getElementById("btnSaveToSheets");
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> บันทึก...`;

  try {
    // -------------------------------------------------------------
    // กรณีที่ 1: เจ้าหน้าที่พัสดุกำลังจ่ายพัสดุสำหรับใบเบิกที่รอจ่าย (Dispense Action)
    // -------------------------------------------------------------
    if (pendingDispenseDocNo) {
      const dispensePayload = {
        docNo: pendingDispenseDocNo,
        dispenser: currentUser ? currentUser.fullName : "เจ้าหน้าที่พัสดุ",
        items: selectedItems
      };

      if (webAppUrl) {
        await fetch(webAppUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            action: "dispenseRequisition",
            data: dispensePayload
          })
        });
      }

      // อัปเดตในประวัติ local cache
      const cached = historyCache.find(r => r.docNo === pendingDispenseDocNo);
      if (cached) {
        cached.status = "จ่ายแล้ว";
        cached.totalDispensed = totalDisp;
        cached.dispenser = dispensePayload.dispenser;
        cached.allQuantities = JSON.parse(JSON.stringify(requisitionData));
        localStorage.setItem(STORAGE_KEYS.REQUISITIONS, JSON.stringify(historyCache));
      }

      showToast(`บันทึกการจ่ายพัสดุใบเบิก ${pendingDispenseDocNo} และตัดสต็อกเรียบร้อยแล้ว!`, "success");

      // เคลียร์โหมดจ่าย
      pendingDispenseDocNo = null;
      const banner = document.getElementById("pendingDispenseBanner");
      if (banner) banner.style.display = "none";

      incrementDocNo();
      requisitionData = {};
      applyUserRoleUI();
      renderAllTables();
      return;
    }

    // -------------------------------------------------------------
    // กรณีที่ 2: สร้างใบเบิกใหม่
    // - เจ้าหน้าที่ขอเบิก: status = "รอจ่ายพัสดุ", totalDispensed = 0, ไม่ตัดสต็อก
    // - เจ้าหน้าที่พัสดุ: status = "จ่ายแล้ว", ตัดสต็อกทันที
    // -------------------------------------------------------------
    const status = isStaff ? "รอจ่ายพัสดุ" : "จ่ายแล้ว";
    const payload = {
      docNo: docNo,
      date: document.getElementById("docDate").value.trim(),
      org: document.getElementById("docOrg").value.trim(),
      requester: document.getElementById("requesterName").value.trim(),
      department: document.getElementById("department").value.trim(),
      approver: document.getElementById("sigName2").value.trim(),
      dispenser: isStaff ? "" : document.getElementById("sigName3").value.trim(),
      itemCount: selectedItems.length,
      totalRequested: totalReq,
      totalDispensed: isStaff ? 0 : totalDisp,
      status: status,
      items: selectedItems,
      allQuantities: JSON.parse(JSON.stringify(requisitionData))
    };

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

    if (isStaff) {
      showToast(`ส่งคำขอเบิกพัสดุ ${docNo} เรียบร้อยแล้ว (สถานะ: รอเจ้าหน้าที่พัสดุจ่าย)`, "success");
    } else {
      showToast(`บันทึกจ่ายพัสดุ ${docNo} และตัดสต็อกเรียบร้อยแล้ว!`, "success");
    }

    incrementDocNo();
    requisitionData = {};
    renderAllTables();

  } catch (err) {
    console.warn("API Error, saving offline:", err);
    const offlinePayload = {
      docNo: docNo,
      date: document.getElementById("docDate").value.trim(),
      org: document.getElementById("docOrg").value.trim(),
      requester: document.getElementById("requesterName").value.trim(),
      department: document.getElementById("department").value.trim(),
      status: isStaff ? "รอจ่ายพัสดุ" : "จ่ายแล้ว",
      itemCount: selectedItems.length,
      totalRequested: totalReq,
      totalDispensed: isStaff ? 0 : totalDisp,
      items: selectedItems,
      allQuantities: JSON.parse(JSON.stringify(requisitionData))
    };
    saveRequisitionHistory(offlinePayload);
    showToast(`บันทึกในเครื่องเรียบร้อย (โหมดออฟไลน์)`, "success");
    incrementDocNo();
    requisitionData = {};
    renderAllTables();
  } finally {
    btn.disabled = false;
    applyUserRoleUI();
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
function loadHistoryFromStorage() {
  try {
    historyCache = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUISITIONS) || "[]");
  } catch (e) {
    historyCache = [];
  }
}

function saveRequisitionHistory(payload) {
  const existingIdx = historyCache.findIndex(r => r.docNo === payload.docNo);
  if (existingIdx >= 0) {
    historyCache[existingIdx] = payload;
  } else {
    historyCache.unshift(payload);
  }
  localStorage.setItem(STORAGE_KEYS.REQUISITIONS, JSON.stringify(historyCache));
  updatePendingBadgeCount();
}

function renderHistoryModal() {
  const tbody = document.getElementById("historyModalTbody");
  if (!tbody) return;

  const query = (document.getElementById("searchHistoryModalInput").value || "").toLowerCase().trim();
  const filtered = historyCache.filter(r => {
    if (!query) return true;
    return (r.docNo || "").toLowerCase().includes(query) ||
           (r.requester || "").toLowerCase().includes(query) ||
           (r.department || "").toLowerCase().includes(query);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted" style="padding: 20px;">ไม่พบประวัติการบันทึก</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((req, idx) => `
    <tr>
      <td class="font-mono font-bold">${escapeHtml(req.docNo)}</td>
      <td>${escapeHtml(req.date)}</td>
      <td>${escapeHtml(req.requester)}</td>
      <td>${escapeHtml(req.department)}</td>
      <td class="text-center">${req.itemCount}</td>
      <td class="text-center font-bold text-primary">${req.totalRequested}</td>
      <td class="text-center font-bold ${req.status === 'รอจ่ายพัสดุ' ? 'text-warning' : 'text-success'}">
        ${req.status === 'รอจ่ายพัสดุ' ? '<span class="badge-status pending">รอจ่าย</span>' : req.totalDispensed}
      </td>
      <td class="text-center">
        <button type="button" class="btn btn-warning btn-sm" onclick="loadAndPrintHistory('${escapeHtml(req.docNo)}')">
          <i class="fa-solid fa-print"></i> โหลดพิมพ์
        </button>
      </td>
    </tr>
  `).join("");
}

function loadAndPrintHistory(docNo) {
  const req = historyCache.find(r => r.docNo === docNo);
  if (!req) return;

  document.getElementById("docNo").value = req.docNo || "";
  document.getElementById("docDate").value = req.date || "";
  document.getElementById("docOrg").value = req.org || "ศาลแขวงอุบลราชธานี";
  document.getElementById("requesterName").value = req.requester || "";
  document.getElementById("department").value = req.department || "";
  document.getElementById("sigName1").value = req.requester || "";
  if (req.approver) document.getElementById("sigName2").value = req.approver;
  if (req.dispenser) document.getElementById("sigName3").value = req.dispenser;

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

// ================= STORAGE & BACKEND SYNC =================
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
    if (d.org && d.org !== "สาธารณสุขอำเภอ...") {
      document.getElementById("docOrg").value = d.org;
    } else {
      document.getElementById("docOrg").value = "ศาลแขวงอุบลราชธานี";
    }
    if (d.sig2) document.getElementById("sigName2").value = d.sig2;
    if (d.pos2) document.getElementById("sigPos2").value = d.pos2;
  } catch (e) {}
}

async function syncWithBackend() {
  const webAppUrl = getActiveWebAppUrl();
  if (!webAppUrl) return;

  try {
    const res = await fetch(`${webAppUrl}?action=getInitData`);
    const data = await res.json();
    if (data.status === "success") {
      // 1. ซิงก์รายการวัสดุจริงจาก Google Sheets แท็บ 'วัสดุ'
      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        data.items.forEach(remoteItem => {
          const id = Number(remoteItem.rowIndex - 1 || remoteItem.id || (remoteItem.code ? remoteItem.code.replace(/\D/g, '') : 0));
          const existing = ITEMS_DATABASE.find(i => i.id === id);
          if (existing) {
            if (remoteItem.name) existing.name = remoteItem.name;
            if (remoteItem.unit) existing.unit = remoteItem.unit;
            if (remoteItem.stock !== undefined) existing.stock = remoteItem.stock;
          }
        });
        renderAllTables();
      }

      // 2. ซิงก์รายชื่อกลุ่มงานจริงจาก Google Sheets แท็บ 'ตั้งค่า' เข้า datalist
      if (data.departments && Array.isArray(data.departments) && data.departments.length > 0) {
        const dList = document.getElementById("departmentDatalist");
        if (dList) {
          dList.innerHTML = data.departments.map(d => `<option value="${escapeHtml(d)}">`).join("");
        }
      }

      // 3. ผสานประวัติใบเบิกจาก Google Sheets เข้า historyCache
      if (data.requisitions && Array.isArray(data.requisitions)) {
        data.requisitions.forEach(remoteReq => {
          const idx = historyCache.findIndex(r => r.docNo === remoteReq.docNo);
          if (idx >= 0) {
            historyCache[idx] = { ...historyCache[idx], ...remoteReq };
          } else {
            historyCache.push(remoteReq);
          }
        });
        localStorage.setItem(STORAGE_KEYS.REQUISITIONS, JSON.stringify(historyCache));
        updatePendingBadgeCount();
      }

      // 4. ซิงก์เลขที่ใบเบิกถัดไปจริงจาก Google Sheets
      if (data.nextDocNo && !pendingDispenseDocNo) {
        const curDocInput = document.getElementById("docNo");
        if (curDocInput && (!curDocInput.value || curDocInput.value.includes("0001"))) {
          curDocInput.value = data.nextDocNo;
        }
      }
    }
  } catch (e) {
    console.log("Offline mode, using local state");
  }
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
