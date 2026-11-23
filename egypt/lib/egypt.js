// Egyptian repair knowledge shared by the API (and mirrored in the front end).
// Prices are rough ranges in EGP that vary by city, brand and original vs copy — always shown as ranges with a date.
export const CATEGORIES = {
  car: "عربية", ac: "تكييف", fridge: "تلاجة", washer: "غسالة", heater: "سخان", stove: "بوتاجاز",
  phone: "موبايل", plumbing: "سباكة", electric: "كهربا", tv: "تليفزيون", other: "حاجة تانية",
};

export const PRICES = {
  updated: "نوفمبر 2026",
  rows: [
    ["car", "بطارية عربية 60–70 أمبير", 3500, 7500],
    ["car", "تيل فرامل أمامي بالتركيب", 900, 3000],
    ["car", "تغيير زيت 4 لتر + فلتر", 900, 3500],
    ["car", "شحن فريون تكييف عربية R134a", 400, 1000],
    ["car", "كشف كمبيوتر OBD", 200, 500],
    ["car", "طقم بوجيهات 4", 400, 1800],
    ["car", "ترصيص وزوايا", 250, 600],
    ["ac", "تكملة فريون تكييف سبليت", 600, 1500],
    ["ac", "شحن فريون كامل بعد تصليح تسريب", 1500, 3500],
    ["ac", "تنظيف تكييف سبليت بالرشاش", 300, 900],
    ["ac", "كابستور تكييف", 250, 700],
    ["ac", "كمبروسر تكييف 1.5 حصان", 7000, 15000],
    ["fridge", "كمبروسر تلاجة شامل الغاز", 4000, 10000],
    ["fridge", "هيتر/تايمر/ترموستات ديفروست", 400, 1200],
    ["washer", "طرمبة صرف غسالة أوتوماتيك", 600, 1600],
    ["washer", "قفل باب غسالة", 500, 1300],
    ["washer", "تايمر غسالة نص أوتوماتيك", 250, 600],
    ["washer", "موتور غسالة نص أوتوماتيك", 1200, 2800],
    ["heater", "هيتر سخان كهربا", 350, 900],
    ["heater", "ترموستات سخان كهربا", 250, 600],
    ["heater", "جلدة/حساس سخان غاز", 200, 700],
    ["stove", "ثيرموكبل بوتاجاز", 200, 500],
    ["phone", "بطارية أندرويد اقتصادي", 500, 1300],
    ["phone", "بطارية آيفون (كوبي عالي)", 1200, 2500],
    ["phone", "بطارية آيفون (توكيل)", 4000, 8000],
    ["phone", "شاشة أندرويد اقتصادي (ريدمي/جالاكسي A)", 1200, 4000],
    ["phone", "شاشة آيفون OLED كوبي", 3500, 7000],
    ["phone", "سوكت شحن أندرويد", 250, 900],
    ["phone", "سوكت شحن آيفون", 800, 2000],
    ["plumbing", "موتور مية 1 حصان", 2500, 6500],
    ["plumbing", "خرطوشة خلاط", 150, 500],
    ["electric", "سكينة/قاطع", 150, 700],
    ["plumbing", "زيارة سباك", 200, 500],
    ["electric", "زيارة كهربائي", 200, 500],
  ],
};
export function priceContext(cat) {
  const rows = PRICES.rows.filter((r) => !cat || r[0] === cat || cat === "other");
  return rows.map((r) => `- ${r[1]}: ${r[2]}–${r[3]} ج.م`).join("\n") || "مفيش أسعار في الجدول للفئة دي.";
}

// Egyptian street names ↔ English, for the parts translator and the AI grounding.
export const DICTIONARY = [
  ["كمبروسر/كباس", "Compressor"], ["كابستور", "Capacitor"], ["ردياتير", "Radiator"], ["دبرياج", "Clutch"], ["مساعدين", "Shock absorbers"],
  ["طرمبة بنزين", "Fuel pump"], ["طرمبة مية", "Water pump"], ["دينامو", "Alternator"], ["مارش", "Starter motor"], ["بوجيهات", "Spark plugs"],
  ["موبينة", "Ignition coil"], ["تيل فرامل", "Brake pads"], ["طنابير/ديسكات", "Brake rotors"], ["كاوتش", "Tire"], ["جنط", "Rim/Wheel"],
  ["عفشة", "Suspension"], ["مقصات وجلب", "Control-arm bushings"], ["بيض", "Ball joints"], ["كوبلن", "CV joint"], ["ترموستات", "Thermostat"],
  ["وش السلندر", "Head gasket"], ["شكمان", "Exhaust / catalytic converter"], ["بخاخات", "Injectors"], ["فتيس", "Gearbox"], ["دركسيون", "Steering"],
  ["كونتاكتور", "Contactor"], ["بوردة", "Control board (PCB)"], ["هيتر", "Heating element"], ["ريليه", "Relay"], ["أوفرلود", "Overload protector"],
  ["طرمبة صرف", "Drain pump"], ["بلف دخول", "Inlet valve"], ["رولمان", "Bearing"], ["فحمات", "Carbon brushes"], ["سير", "Belt"],
  ["عمود ماغنسيوم", "Anode rod"], ["جلدة مية", "Diaphragm"], ["ثيرموكبل", "Thermocouple"], ["فونيات", "Burner nozzles"], ["سكينة", "Circuit breaker"],
  ["مفتاح أرضي (RCD)", "Residual-current device"], ["خرطوشة", "Cartridge"], ["عوامة", "Float valve"], ["سوكت/فلاتة", "Charging port / flex"], ["تاتش", "Touch digitizer"],
];

// Emergency numbers in Egypt (show prominently; verify before launch).
export const EMERGENCY = [["طوارئ الغاز", "129"], ["الإسعاف", "123"], ["المطافي", "180"], ["طوارئ الكهربا", "121"], ["حماية المستهلك", "19588"]];
