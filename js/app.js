/* ==========================================================================
   Summertimes Travel Ltd — Dispatch Operations Hub
   All parsing / rendering / contact logic. Runs fully client-side & offline.
   ========================================================================== */

pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/vendor/pdf.worker.min.js';

// MASTER TOUR OPERATORS LIST
const MASTER_TOUR_OPERATORS = [
    "BILLA REISEN",
    "DERTOUR DELUXE",
    "DERTOUR INTERNATIONAL",
    "DERTOUR ROMANIA",
    "DERTOUR OTS",
    "DERTOUR X",
    "DERTOUR",
    "DERTOURISTIK CZ (FISCHE",
    "DERTOURISTIK SK (FISCHE",
    "EASYJET HOLIDAYS",
    "ELIZA WAS HERE",
    "GRECOS HOLIDAY SO. Z.O.O",
    "HELVETIC TOURS",
    "ITS COOP TRAVEL",
    "ITS REISEN",
    "KARTAGO HUNGARY TOUR",
    "KARTAGO SLOVAKIA TOUR",
    "KUONI OTS",
    "KUONI X",
    "KUONI",
    "LOVE HOLIDAYS LTD",
    "OLIVES TRAVEL",
    "OTS SLR",
    "SCHAUINSLAND REISEN",
    "SCHAUINSLAN",
    "SILVERJET BELGIUM",
    "SILVERJET VAKANTIES NL",
    "SOVEREIGN LUXURY TRAV",
    "SUMMERTIMES",
    "SUNWEB SWEDEN",
    "SUNWEB",
    "TRAVELIX",
    "VERATOUR",
    "XHELVETIC",
    "XITS"
];

// Some operator names get column-width truncated in the PDF manifest (e.g.
// "GRECOS HOLI" instead of "GRECOS HOLIDAY SO. Z.O.O"), and the cutoff point
// varies row to row depending on how much else shares that field (flight
// code length, etc.) - so a fixed hardcoded alias only ever fixes one exact
// truncation length. OPERATOR_ALIASES stays as a manual override for known
// exact strings; resolveOperatorFromText() below also generically handles
// ANY truncation length by prefix-matching against MASTER_TOUR_OPERATORS.
const OPERATOR_ALIASES = {
    "GRECOS HOLI": "GRECOS HOLIDAY SO. Z.O.O"
};

function resolveOperatorFromText(upperRowText) {
    // 1) Manual overrides for known exact truncated strings.
    for (const alias in OPERATOR_ALIASES) {
        if (upperRowText.includes(alias)) return OPERATOR_ALIASES[alias];
    }
    // 2) Full operator name present verbatim.
    for (const op of MASTER_TOUR_OPERATORS) {
        if (upperRowText.includes(op)) return op;
    }
    // 3) Generic fallback: the row may contain only a truncated prefix of
    // an operator's name cut at an arbitrary width. Try each operator's
    // name at decreasing lengths and keep whichever match is longest
    // (i.e. most specific/confident) across all operators.
    const MIN_PREFIX_LEN = 6;
    let bestMatch = null;
    let bestLen = 0;
    for (const op of MASTER_TOUR_OPERATORS) {
        for (let len = op.length - 1; len >= MIN_PREFIX_LEN; len--) {
            const prefix = op.substring(0, len);
            if (upperRowText.includes(prefix)) {
                if (len > bestLen) {
                    bestLen = len;
                    bestMatch = op;
                }
                break; // longest prefix found for this operator, try next operator
            }
        }
    }
    return bestMatch;
}

// MASTER HOTEL DIRECTORY
const HOTEL_DIRECTORY = {
    "ADAMS BEACH": "23840000",
    "AKTEA BEACH VILLAGE": "23845000",
    "AKTI BEACH": "26272777",
    "ALECOS HOTEL APTS": "26950225",
    "ALEXANDER THE GREAT": "26824000",
    "ALIATHON AEGEAN": "26964400",
    "ALION BEACH": "23722900",
    "ALMYRA (THANOS)": "26888700",
    "ALMYRA HOTEL": "26888700",
    "ALVA HOTEL APARTMENTS": "23831515",
    "ALVA HOTEL APTS": "23831515",
    "AMANTI": "25274590",
    "AMARANDE HOTEL": "23819900",
    "AMAVI (KANIKA)": "26522500",
    "AMETHYST NAPA": "23725985",
    "ANAIS BAY": "23831351",
    "ANASTASIA": "23832633",
    "ANDREOTIS HOTEL APTS": "23831250",
    "ANEMI SUITES": "26945666",
    "ANESIS HOTEL": "23721104",
    "ANMARIA BEACH": "23725300",
    "ANNABELLE HOTEL": "26885000",
    "ANTHEA HOTEL APARTMENTS": "23721411",
    "ANTIGONI HOTEL": "22320435",
    "AQUAMARE HOTEL": "26966000",
    "AZIA RESORT & SPA": "26845100",
    "ASCOS BEACH": "26621801",
    "ASTERIAS BEACH": "23201000",
    "ASTERIAS BEACH HOTEL": "23201000",
    "ATHENA BEACH HOTEL": "26965300",
    "ATHENA ROYAL BEACH": "26884600",
    "ATLANTICA AENEAS RESORT": "23724000",
    "ATLANTICA AKTEON": "26956770",
    "ATLANTICA AQUA BLUE": "23849999",
    "ATLANTICA CALLISTO": "23829900",
    "ATLANTICA GOLDEN": "26947777",
    "ATLANTICA MARE VILLAGE": "23721401",
    "ATLANTICA PANTHEA": "23202300",
    "ATLANTICA SANCTA NAPA": "23721011",
    "ATLANTICA SUNDARDEN BEACH": "23721000",
    "ATLANTICA SUNGARDEN PARK": "23500500",
    "AVANTI HOLIDAY VILLAGE": "26965555",
    "AVANTI HOTEL": "26965555",
    "AVANTI VILLAGE": "26965555",
    "AVLIDA HOTEL": "26946000",
    "AZIA BEACH": "26845100",
    "BASILICA HOLIDAY RESORT": "26938487",
    "BASILICA GARDENS": "26938487",
    "BOHEMIAN GARDENS": "23814120",
    "CALI RESORT & SPA": "26956868",
    "CAPITAL COAST BEACH": "26201000",
    "CAPO BAY": "23831101",
    "CAPTAIN PEIR": "23831433",
    "CAVO MARIS": "23832043",
    "CAVO MARIS BEACH HOTEL": "23832043",
    "CAVO ZOE SEASIDE": "23730500",
    "CBH ASIMINA SUITES": "26964333",
    "CHRISTABELLA HOTEL APTS": "23721860",
    "CHRISTABELLA HTL APTS": "23721860",
    "CHRISTOFINIA HOTEL": "23816000",
    "CONSTANTINOS THE GREAT": "23834000",
    "CORAL BEACH HOTEL": "26881000",
    "CORALLIA HOTEL APTS": "26622121",
    "COSMELENIA": "23723060",
    "COSMO NAPA": "23840900",
    "CRYSTAL COVE HOTEL": "23845900",
    "CRYSTAL SPRINGS": "23826900",
    "CYNTHIANNA BEACH": "26933900",
    "CYPRIA BAY HOTEL": "26882688",
    "CYPRIA MARIS HOTEL": "26964111",
    "DAMON APTS": "26949300",
    "DIONYSOS HOTEL": "26933414",
    "ELENI HOLIDAY VILLAGE": "26934200",
    "ELIGONIA HOTEL APTS": "23819292",
    "ELYSIUM (STADEMOS)": "26844444",
    "ELYSIUM HOTEL": "26844444",
    "EURONAPA HTL APTS": "23722444",
    "EVABELLE NAPA": "23723100",
    "EVALENA BEACH HOTEL": "23832222",
    "FAROS HOTEL": "23816100",
    "FLAMINGO PARADISE": "23843800",
    "GAIA SUN N BLUE": "23723600",
    "GOLDEN COAST": "23814000",
    "GOLDEN COAST HOTEL": "23814000",
    "GRECIAN BAY": "23842000",
    "GRECIAN PARK": "23844000",
    "GRECIAN SAND": "23721616",
    "GREEN BUNGALOWS": "23721511",
    "HELIOS BAY APTS": "26935656",
    "ILIADA BEACH": "23833200",
    "IVI MARE HOTEL": "26913555",
    "LOUIS IVI MARE": "26913555",
    "KAPETANIOS AQUA RESORT": "26964000",
    "KAPETANIOS BAY": "23831170",
    "KEFALONITIS HOTEL APTS": "26945866",
    "KEFALOS BEACH TOURIST VILLAGE": "26934000",
    "KEFALOS VILLAGE": "26934000",
    "KING EVELTHON HOTEL": "26930100",
    "KISSOS HOTEL": "26936111",
    "KOKKINOS  BOUTIQUE": "23831444",
    "KONNOS BAY HOTEL": "23831630",
    "LAURA BEACH": "26944900",
    "LEDRA BEACH": "26964848",
    "LEONARDO CRYSTAL COVE": "23845900",
    "LEONARDO PLAZA CYPRIA MARIS": "26964111",
    "LIMANAKI BEACH": "23721600",
    "LIVAS HTL APTS": "23831756",
    "LOUIS ALTHEA BEACH": "23814141",
    "LOUIS IMPERIAL ISLAND RESORT": "26965415",
    "LOUTISIANA": "23722666",
    "M BOUTIQUE": "26933500",
    "MAKRONISSOS VILLAGE": "23721416",
    "MALAMA BEACH HOLIDAY VILLAGE": "23822000",
    "MALAMA VILLAGE": "23822000",
    "MARE AYIA NAPA": "23721401",
    "MANDALENA HOTEL APTS": "23832944",
    "MANDALENA APTS": "23832944",
    "MANDALI HOTEL": "23814100",
    "MARGADINA HOTEL": "23815000",
    "MARINA HOTEL": "23721721",
    "MARIS GRAND WATERPARK": "23740999",
    "MARLITA BEACH": "23831420",
    "MAYFAIR HOTEL": "26948000",
    "MELISSI BEACH": "23724800",
    "MELPO ANITA": "23721921",
    "MIMOSA BEACH": "23832797",
    "MYROU ANDROU": "23832810",
    "NAPA MERMAID": "23721606",
    "NAPA PLAZA": "23816555",
    "NARCISSOS": "23833800",
    "NATURA BEACH HOTEL": "26321011",
    "NELIA BEACH": "23722727",
    "NELIA GARDENS": "23723700",
    "NEREUS HOTEL": "26943101",
    "NESTOR HOTEL": "23722880",
    "NICHOLAS COLOR": "23723988",
    "NISSI BEACH": "23721021",
    "NISSI BLU BEACH": "23200500",
    "NISSI PARK": "23721121",
    "NISSIANA HOTEL": "23725800",
    "ODESSA BEACH": "23831645",
    "OKEANOS BEACH": "23724440",
    "OLYMPIC LAGOON": "25274590",
    "PANDREAM HOTEL APTS": "26964888",
    "PANDREAM APTS": "26964888",
    "PAPANTONIA APTS": "23832097",
    "PAPHOS BREEZE": "26950200",
    "PAPHOS GARDENS": "26882000",
    "PAVLO NAPA BEACH": "23722400",
    "PERNERA BEACH": "23831011",
    "PETROSANA HTL APTS": "23725444",
    "PHEATHON BEACH": "26964600",
    "PIERE  ANNE BEACH": "23722730",
    "PRINCESS VERA APTS": "26600100",
    "PYRAMOS HOTEL": "26930222",
    "QUEENS BAY": "26946600",
    "RIVER ROCK HOTEL": "23722722",
    "SEAGULL": "23831270",
    "SENATOR HOTEL APTS": "23845400",
    "SENATOR HTL APTS": "23845400",
    "SILVER SANDS": "23831590",
    "SO NICE BEACH": "23723010",
    "SOFIANNA RESORT & SPA": "26949000",
    "ST ELIAS RESORT": "23831300",
    "ST GEROGE BEACH HOTEL": "26845000",
    "ST. GEORGE HOTEL & SPA RESORT": "26845000",
    "STAMATIA": "23722723",
    "SUNNY HILLS APTS": "26222004",
    "SUNRISE BEACH": "23831501",
    "SUNRISE GARDEN HTL": "23831466",
    "SUNRISE JADE": "23813700",
    "SUNRISE OASIS": "23832211",
    "SUNRISE PEARL": "23831500",
    "TASIA MARIS BEACH": "23722770",
    "TASIA MARIS OASIS": "23721026",
    "TASIA MARIS SANDS": "23725400",
    "TASIA MARIS SEASONS": "23813400",
    "TASMARIA HOTEL APTS": "26946800",
    "THALASSA": "26881500",
    "THALASSINES VILLAS": "23744866",
    "THE BLUE IVY": "23832500",
    "THE DOME BEACH": "23721006",
    "THEO SUNSET": "26940840",
    "TOXOTIS HOTEL": "23814555",
    "TOXOTIS HTL APTS": "23814555",
    "TSOKKOS ASCOS CORAL BEACH": "26885000",
    "TSOKKOS CHRYSOMARE": "23848500",
    "TSOKKOS CONSTANTINOS THE GREA": "23834000",
    "TSOKKOS DOME BEACH HOTEL": "23721006",
    "TSOKKOS GARDENS": "23833636",
    "TSOKKOS PARADISE": "23816500",
    "TSOKKOS PROTARAS": "23831363",
    "VANGELIS HTL APTS": "23813600",
    "VASSOS NISSI PLAGE": "23723003",
    "VENUS BEACH": "26949200",
    "VRACHIA BEACH": "26940950",
    "VRISSAKI BEACH": "23831333",
    "VRISSAKI HOTEL APTS": "23831333",
    "VRISSIANA BEACH": "23833444"
};

// Distinct accent colors cycled per voucher so cards are easy to tell apart
// at a glance in a long list. Assigned deterministically from the voucher's
// key so the same voucher keeps the same color across re-renders/filters.
const VOUCHER_ACCENT_PALETTE = [
    'accent-blue',
    'accent-emerald',
    'accent-purple',
    'accent-orange',
    'accent-pink',
    'accent-teal',
    'accent-indigo',
    'accent-rose'
];

function hashStringToIndex(str, mod) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash % mod;
}

let extractedManifests = [];
let excelDriversMap = {};
let airportStaffMap = {};
let activeTransferTab = 'arrival';
let activePrefixTab = 'ALL';
let activeOperatorFilter = 'ALL';
let activeDateFilter = 'ALL';
let currentModalPhoneRaw = "";
let headerCollapsed = false;
let filterBarCollapsed = false;
let activeCameraStreamObject = null;

const COMMENTS_SYSTEM_STATIC_URL = "https://s34summer.github.io/Easy-Jet-Call-Log/";
const GPS_SYSTEM_STATIC_URL = "https://departures.summertimes.com.cy/";

// Initialize Tour Operator Drop-down Options
window.addEventListener('DOMContentLoaded', () => {
    const selectNode = document.getElementById('operatorSelect');
    MASTER_TOUR_OPERATORS.forEach(op => {
        const opt = document.createElement('option');
        opt.value = op;
        opt.textContent = op;
        selectNode.appendChild(opt);
    });

    // On phones, start with the upload grid and filter chips/dropdowns
    // collapsed so the tabs and search are usable without a tall header.
    // Desktop keeps everything open as before.
    if (window.matchMedia("(max-width: 639px)").matches) {
        headerCollapsed = true;
        document.getElementById('collapsibleContent').classList.add('hidden');
        document.getElementById('toggleBtnIcon').innerText = "▼";

        filterBarCollapsed = true;
        document.getElementById('filterBarContent').classList.add('hidden');
        document.getElementById('filterToggleBtnIcon').innerText = "▼";
    }
});

document.getElementById('searchInput').addEventListener('input', renderManifestCards, false);
document.getElementById('pdfArrivals').addEventListener('change', (e) => handlePDFUpload(e, 'arrival'), false);
document.getElementById('pdfDepartures').addEventListener('change', (e) => handlePDFUpload(e, 'departure'), false);
document.getElementById('excelDrivers').addEventListener('change', handleExcelUpload, false);
document.getElementById('excelAirportPlan').addEventListener('change', handleAirportPlanUpload, false);

function handleOperatorFilterChange(selectedOp) {
    activeOperatorFilter = selectedOp;
    renderManifestCards();
}

function handleDateFilterChange(selectedDate) {
    activeDateFilter = selectedDate;
    renderManifestCards();
}

function updateDateDropdownOptions() {
    const dateSelectNode = document.getElementById('dateSelect');
    dateSelectNode.innerHTML = '<option value="ALL">📅 All Dates</option>';

    const uniqueDates = new Set();
    extractedManifests.forEach(m => {
        if (m.manifestDate && m.manifestDate !== "N/A") {
            uniqueDates.add(m.manifestDate);
        }
    });

    Array.from(uniqueDates).sort().forEach(dateStr => {
        const opt = document.createElement('option');
        opt.value = dateStr;
        opt.textContent = `📅 Date: ${dateStr}`;
        dateSelectNode.appendChild(opt);
    });
}

function toggleHeader() {
    headerCollapsed = !headerCollapsed;
    const cNode = document.getElementById('collapsibleContent');
    const icon = document.getElementById('toggleBtnIcon');

    if (headerCollapsed) {
        cNode.classList.add('hidden');
        icon.innerText = "▼";
    } else {
        cNode.classList.remove('hidden');
        icon.innerText = "▲";
    }
}

function toggleFilterBar() {
    filterBarCollapsed = !filterBarCollapsed;
    const cNode = document.getElementById('filterBarContent');
    const icon = document.getElementById('filterToggleBtnIcon');

    if (filterBarCollapsed) {
        cNode.classList.add('hidden');
        icon.innerText = "▼";
    } else {
        cNode.classList.remove('hidden');
        icon.innerText = "▲";
    }
}

// Auto-hide the entire header (hero band + controls) on scroll-down
// to free up the full screen for reading vouchers. It only reappears once
// you're back near the top of the page - not on scroll-up - since bringing
// it back mid-scroll was confusing.
let lastScrollY = window.scrollY;
let scrollHideTicking = false;

function handleHeaderAutoHide() {
    const headerEl = document.getElementById('mainHeader');
    const currentY = window.scrollY;
    const delta = currentY - lastScrollY;

    if (currentY <= 20) {
        headerEl.classList.remove('header-hidden');
    } else if (delta > 5) {
        headerEl.classList.add('header-hidden');
    }

    lastScrollY = currentY;
    scrollHideTicking = false;
}

window.addEventListener('scroll', () => {
    if (!scrollHideTicking) {
        window.requestAnimationFrame(handleHeaderAutoHide);
        scrollHideTicking = true;
    }
}, { passive: true });

function highlightText(sourceText, queryText) {
    if (!queryText) return sourceText;
    const escapedQuery = queryText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return sourceText.replace(regex, '<mark class="hl">$1</mark>');
}

function setActiveTab(tabType) {
    const arrBtn = document.getElementById('tabArrivalBtn');
    const depBtn = document.getElementById('tabDepartureBtn');
    activeTransferTab = tabType;

    if (tabType === 'arrival') {
        arrBtn.classList.add('tab-active');
        depBtn.classList.remove('tab-active');
    } else {
        depBtn.classList.add('tab-active');
        arrBtn.classList.remove('tab-active');
    }
    renderManifestCards();
}

function setActivePrefix(prefixType) {
    activePrefixTab = prefixType;
    const btns = {
        ALL: document.getElementById('prefixAllBtn'),
        TAXI: document.getElementById('prefixTaxiBtn'),
        SHUTTLE: document.getElementById('prefixShuttleBtn'),
        ADAPTED: document.getElementById('prefixAdaptedBtn')
    };

    Object.keys(btns).forEach(key => {
        if (key === prefixType) {
            btns[key].classList.add('chip-active');
        } else {
            btns[key].classList.remove('chip-active');
        }
    });
    renderManifestCards();
}

function formatClientPhoneNumber(rawString) {
    if (!rawString) return "";
    let digits = String(rawString).replace(/\D/g, "");
    if (digits.length < 6 || /^0+$/.test(digits)) return "";
    if (digits.startsWith("00")) return digits;
    return "00" + digits;
}

function formatDriverPhoneNumber(rawString) {
    if (!rawString) return "";
    return String(rawString).replace(/\s+/g, "").trim();
}

function copyTextToClipboard(text) {
    // Chromium-based browsers (Chrome, Edge) treat file:// as a
    // "secure context", so window.isSecureContext is true even when
    // opening this file directly rather than via https - that meant
    // the modern Clipboard API branch kept being used here and
    // silently failing (permissions/focus quirks), while a fallback
    // never got a chance to run. execCommand('copy') is now always
    // tried first since it doesn't depend on any of that; the modern
    // API is only attempted afterwards, as a bonus, if it reports failure.
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    textarea.style.fontSize = '16px';
    document.body.appendChild(textarea);

    textarea.focus();
    textarea.setSelectionRange(0, text.length);

    let copied = false;
    try {
        copied = document.execCommand('copy');
    } catch (err) {
        console.error("Legacy clipboard copy failed: ", err);
    }

    document.body.removeChild(textarea);

    if (!copied && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(err => {
            console.error("Clipboard API copy also failed: ", err);
        });
    }

    if (!copied) {
        // Some mobile browsers block scripted clipboard access
        // entirely (both execCommand and the Clipboard API) when a
        // page is opened as a local file instead of served over
        // https. If that's what's happening, fall back to a native
        // prompt so the number can still be copied manually - long
        // press the text, Select All, then Copy - since that's a
        // browser-chrome interaction and isn't blocked the same way.
        window.prompt("Copy this reference number (long-press \u2192 Select All \u2192 Copy):", text);
    }
}

function handleSystemRedirect(refNum, systemUrlBase) {
    // Copy first, while this tab still definitely has focus - the
    // Clipboard API silently fails once focus shifts, and opening a
    // new tab can shift focus immediately. window.open must still
    // fire synchronously right after, in the same click handler, or
    // mobile browsers block it as a pop-up.
    copyTextToClipboard(refNum);
    window.open(`${systemUrlBase}?ref=${refNum}`, '_blank');
}

async function handleContactClick(event, name, phone, mode) {
    if (window.matchMedia("(min-width: 1024px)").matches) {
        event.preventDefault();

        currentModalPhoneRaw = phone;
        document.getElementById('modalPassengerName').innerText = name;
        document.getElementById('modalPhoneNumber').innerText = phone;
        document.getElementById('modalActionType').innerText = mode === 'tel' ? '📞 CELLULAR DIAL ROUTE' : '💬 WHATSAPP AUDIO CALL';

        const qrContainer = document.getElementById('qrcodeCanvas');
        const videoNode = document.getElementById('cameraPreviewStream');

        qrContainer.innerHTML = "";
        qrContainer.classList.remove('hidden');
        videoNode.classList.add('hidden');

        let qrPayload = "";
        if (mode === 'tel') {
            qrPayload = `tel:${phone}`;
        } else {
            let cleanWhatsAppNum = phone.startsWith("00") ? phone.replace(/^00/, "+") : phone;
            if (!cleanWhatsAppNum.startsWith("+") && cleanWhatsAppNum.length > 6) {
                cleanWhatsAppNum = "+" + cleanWhatsAppNum;
            }
            qrPayload = `https://wa.me/${cleanWhatsAppNum}`;
        }

        new QRCode(qrContainer, {
            text: qrPayload,
            width: 160,
            height: 160,
            colorDark: "#0F172A",
            colorLight: "#FFFFFF",
            correctLevel: QRCode.CorrectLevel.H
        });

        document.getElementById('desktopModal').classList.remove('hidden');
    } else {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            initiateAsyncMobileCameraWarmup();
        }
    }
}

async function initiateAsyncMobileCameraWarmup() {
    const videoNode = document.getElementById('cameraPreviewStream');
    const qrContainer = document.getElementById('qrcodeCanvas');

    if (activeCameraStreamObject) {
        activeCameraStreamObject.getTracks().forEach(track => track.stop());
    }

    const hardwareConstraints = {
        video: {
            facingMode: "environment",
            width: { ideal: 640 },
            height: { ideal: 480 }
        },
        audio: false
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(hardwareConstraints);
        activeCameraStreamObject = stream;

        videoNode.srcObject = stream;
        qrContainer.classList.add('hidden');
        videoNode.classList.remove('hidden');

        setTimeout(() => {
            videoNode.play().catch(err => console.log("Stream play deferred: ", err));
        }, 150);

    } catch (err) {
        console.warn("Hardware stream warm-up skipped, falling back to graphics context rendering mode.", err);
        qrContainer.classList.remove('hidden');
        videoNode.classList.add('hidden');
    }
}

function stopCameraAndCloseModal() {
    if (activeCameraStreamObject) {
        activeCameraStreamObject.getTracks().forEach(track => track.stop());
        activeCameraStreamObject = null;
    }
    document.getElementById('desktopModal').classList.add('hidden');
}

function closeDesktopModal(event) {
    stopCameraAndCloseModal();
}

function copyModalNumber() {
    if (currentModalPhoneRaw) {
        copyTextToClipboard(currentModalPhoneRaw);
        alert("Phone number copied to clipboard: " + currentModalPhoneRaw);
    }
}

function handleAirportPlanUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById('statusMessage').innerHTML = `<span class='msg-warn pulse'>⏳ READING AIRPORT PLAN ROSTER...</span>`;

    const reader = new FileReader();

    reader.onerror = function () {
        console.error("FileReader failed:", reader.error);
        document.getElementById('statusMessage').innerHTML =
            `<span class='msg-err'>❌ Could not read file: ${reader.error}</span>`;
        alert("File read error: " + reader.error);
    };

    reader.onload = function (evt) {
        try {
            const data = cleanFileBytes(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array', cellNF: true, cellText: true });

            airportStaffMap = {};
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const sheetData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: false });

            // Locate the header row and its ArrDep / FlyName / Remarks columns by
            // matching header text rather than assuming fixed column positions -
            // the roster's column layout can shift between exports.
            let headerRowIdx = -1;
            let colArrDep = -1, colFlight = -1, colRemarks = -1;

            for (let r = 0; r < Math.min(sheetData.length, 20); r++) {
                const row = sheetData[r];
                if (!row) continue;

                let foundArrDep = -1, foundFlight = -1, foundRemarks = -1;
                row.forEach((cell, cIdx) => {
                    const cellText = String(cell || "").replace(/\s+/g, "").toLowerCase();
                    if (!cellText) return;
                    if (foundArrDep === -1 && /^arr.?dep$/.test(cellText)) foundArrDep = cIdx;
                    if (foundFlight === -1 && (cellText.includes("flyname") || cellText.includes("flightname") || cellText.includes("flightno") || cellText === "flight")) foundFlight = cIdx;
                    if (foundRemarks === -1 && cellText.includes("remark")) foundRemarks = cIdx;
                });

                if (foundArrDep !== -1 && foundFlight !== -1 && foundRemarks !== -1) {
                    headerRowIdx = r;
                    colArrDep = foundArrDep;
                    colFlight = foundFlight;
                    colRemarks = foundRemarks;
                    break;
                }
            }

            if (headerRowIdx === -1) {
                throw new Error("Could not find ArrDep / FlyName / Remarks header columns in this sheet.");
            }

            let mappedCount = 0;

            for (let r = headerRowIdx + 1; r < sheetData.length; r++) {
                const row = sheetData[r];
                if (!row) continue;

                const arrDep = String(row[colArrDep] || "").trim().toUpperCase();
                const flightCode = String(row[colFlight] || "").trim().toUpperCase();
                const staffRemarks = String(row[colRemarks] || "").trim();

                if (arrDep === "A" && flightCode && staffRemarks) {
                    airportStaffMap[flightCode] = staffRemarks;
                    mappedCount++;
                }
            }

            applyAirportStaffToManifests();
            document.getElementById('statusMessage').classList.add('hidden');
            alert(`Airport Plan imported! ${mappedCount} arrival flight reps assigned.`);
            renderManifestCards();
        } catch (err) {
            console.error("Airport plan parse error:", err);
            document.getElementById('statusMessage').innerHTML =
                `<span class='msg-err'>❌ Error reading airport plan: ${err.message}</span>`;
            alert("Error reading airport plan: " + err.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

function applyAirportStaffToManifests() {
    extractedManifests.forEach(manifest => {
        if (manifest.type === 'arrival' && manifest.flight && airportStaffMap[manifest.flight]) {
            manifest.airportStaff = airportStaffMap[manifest.flight];
            manifest.searchString += ` ${manifest.airportStaff}`.toLowerCase();
        }
    });
}

function handleExcelUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById('statusMessage').innerHTML = `<span class='msg-ok pulse'>⏳ INITIATING EXCEL ALLOCATIONS ENGINE...</span>`;

    const reader = new FileReader();

    reader.onerror = function () {
        console.error("FileReader failed:", reader.error);
        document.getElementById('statusMessage').innerHTML =
            `<span class='msg-err'>❌ Could not read file: ${reader.error}</span>`;
        alert("File read error: " + reader.error);
    };

    reader.onload = function (evt) {
        let workbook;
        try {
            const data = cleanFileBytes(evt.target.result);
            workbook = XLSX.read(data, { type: 'array', cellNF: true, cellText: true });
        } catch (err) {
            console.error("Drivers sheet parse error:", err);
            document.getElementById('statusMessage').innerHTML =
                `<span class='msg-err'>❌ Error reading drivers sheet: ${err.message}</span>`;
            alert("Error reading drivers sheet: " + err.message);
            return;
        }

        excelDriversMap = {};
        let sheetNamesList = workbook.SheetNames;
        let currentSheetIdx = 0;
        let totalProcessedRows = 0;

        function processNextExcelSheetChunk() {
            try {
                if (currentSheetIdx < sheetNamesList.length) {
                    let sheetName = sheetNamesList[currentSheetIdx];
                    const worksheet = workbook.Sheets[sheetName];
                    const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

                    let currentRowIdx = 1;

                    function processRowBatchInsideSheet() {
                        try {
                            let batchCount = 0;
                            while (currentRowIdx < sheetData.length && batchCount < 50) {
                                const row = sheetData[currentRowIdx];
                                if (row && row.length >= 2) {
                                    const voucher = String(row[1] || "").trim();
                                    const driverName = String(row[4] || "").trim();
                                    const driverPhone = String(row[5] || "").trim();

                                    if (voucher && voucher !== "undefined") {
                                        excelDriversMap[voucher] = {
                                            name: driverName || "Assigned Driver",
                                            phone: formatDriverPhoneNumber(driverPhone)
                                        };
                                        totalProcessedRows++;
                                    }
                                }
                                currentRowIdx++;
                                batchCount++;
                            }

                            document.getElementById('statusMessage').innerHTML = `<span class='msg-ok pulse'>⏳ DECOMPRESSING DRIVERS SHEET: "${sheetName.toUpperCase()}" [ROW ${currentRowIdx}/${sheetData.length}]...</span>`;

                            if (currentRowIdx < sheetData.length) {
                                setTimeout(processRowBatchInsideSheet, 1);
                            } else {
                                currentSheetIdx++;
                                setTimeout(processNextExcelSheetChunk, 5);
                            }
                        } catch (rowErr) {
                            console.error("Row batch error:", rowErr);
                            document.getElementById('statusMessage').innerHTML =
                                `<span class='msg-err'>❌ Error processing drivers sheet row: ${rowErr.message}</span>`;
                            alert("Error processing drivers sheet: " + rowErr.message);
                        }
                    }
                    processRowBatchInsideSheet();
                } else {
                    applyExcelDriversToLoadedManifests();
                    document.getElementById('statusMessage').classList.add('hidden');
                    alert(`Driver roster parsed successfully. Linked allocations.`);
                    renderManifestCards();
                }
            } catch (sheetErr) {
                console.error("Sheet processing error:", sheetErr);
                document.getElementById('statusMessage').innerHTML =
                    `<span class='msg-err'>❌ Error processing drivers sheet: ${sheetErr.message}</span>`;
                alert("Error processing drivers sheet: " + sheetErr.message);
            }
        }
        processNextExcelSheetChunk();
    };
    reader.readAsArrayBuffer(file);
}

function applyExcelDriversToLoadedManifests() {
    extractedManifests.forEach(manifest => {
        const vId = manifest.voucherId;
        if (vId && excelDriversMap[vId]) {
            if (excelDriversMap[vId].name) manifest.driverName = excelDriversMap[vId].name;
            if (excelDriversMap[vId].phone) {
                manifest.driverPhone = excelDriversMap[vId].phone;
            }
        }
    });
}

function cleanFileBytes(arrayBuffer) {
    // Copy into a fresh, standalone buffer immediately. Some Android/MIUI
    // browsers (Redmi/Xiaomi) reuse or invalidate the FileReader's ArrayBuffer
    // after onload, which makes pdf.js / SheetJS read no data at all.
    const data = new Uint8Array(arrayBuffer.byteLength);
    data.set(new Uint8Array(arrayBuffer));
    return data;
}

async function handlePDFUpload(e, transferType) {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById('statusMessage').innerHTML = `<span class='msg-info pulse'>⏳ PROCESSING ${transferType.toUpperCase()} MANIFEST...</span>`;

    const fileReader = new FileReader();

    // Surface FileReader failures instead of hanging silently.
    // Content:// URIs from some Android file pickers (notably MIUI/Xiaomi)
    // can fail to read fully; previously this had no handler at all.
    fileReader.onerror = function () {
        console.error("FileReader failed:", fileReader.error);
        document.getElementById('statusMessage').innerHTML =
            `<span class='msg-err'>❌ Could not read file: ${fileReader.error}</span>`;
        alert("File read error: " + fileReader.error);
    };

    fileReader.onload = function () {
        const src = this.result;
        if (!src || !src.byteLength) {
            document.getElementById('statusMessage').innerHTML =
                `<span class='msg-err'>❌ The selected file returned no data.</span>`;
            alert("The selected PDF returned no data. On some phones (e.g. Redmi/Xiaomi) the system file picker can fail to read large files - try another browser or a smaller file.");
            return;
        }
        loadPdfManifest(cleanFileBytes(src), transferType, false);
    };
    fileReader.readAsArrayBuffer(file);
}

async function loadPdfManifest(data, transferType, retried) {
    try {
        // Timeout guard: on some Xiaomi/Redmi browsers the PDF.js Web Worker
        // never responds, so loading can hang forever. Abort and fall back to
        // the main-thread ("fake worker") path below.
        const loadingTask = pdfjsLib.getDocument({ data });
        const pdf = await Promise.race([
            loadingTask.promise,
            new Promise((_, reject) => {
                setTimeout(() => {
                    loadingTask.destroy();
                    reject(new Error("PDF worker did not respond (timeout)"));
                }, 30000);
            })
        ]);
        processPdfPages(pdf, transferType);
    } catch (error) {
        console.error(error);
        if (!retried && pdfjsLib.PDFWorkerUtil) {
            // Force parsing on the main thread - works on browsers where the
            // Web Worker path silently fails (seen on Redmi/Xiaomi devices).
            console.warn("PDF load failed, retrying on main thread (fake worker).");
            pdfjsLib.PDFWorkerUtil.isWorkerDisabled = true;
            loadPdfManifest(data, transferType, true);
            return;
        }
        document.getElementById('statusMessage').innerHTML =
            `<span class='msg-err'>❌ Error parsing PDF: ${error.message}</span>`;
        alert("Error parsing PDF data streams: " + error.message);
    }
}

function processPdfPages(pdf, transferType) {
    let totalPages = pdf.numPages;
    let processPageIdx = 1;

    function processNextPageChunk() {
        if (processPageIdx <= totalPages) {
            pdf.getPage(processPageIdx).then(async (page) => {
                try {
                    const textContent = await page.getTextContent();
                    const items = textContent.items.map(item => ({
                        text: item.str.trim(),
                        y: item.transform[5],
                        x: item.transform[4]
                    })).filter(item => item.text !== "");

                    if (items.length > 0) {
                        parseTopDownSequentialLayout(items, transferType);
                    }

                    document.getElementById('statusMessage').innerHTML = `<span class='msg-info pulse'>⏳ DECOMPRESSING MANIFEST: PAGE ${processPageIdx} OF ${totalPages}...</span>`;
                    processPageIdx++;
                    setTimeout(processNextPageChunk, 5);
                } catch (pageErr) {
                    // Was previously an unhandled rejection that just froze the UI at
                    // "Processing..." with no indication of what went wrong.
                    console.error("Page parse error on page " + processPageIdx, pageErr);
                    document.getElementById('statusMessage').innerHTML =
                        `<span class='msg-err'>❌ Failed parsing page ${processPageIdx}: ${pageErr.message}</span>`;
                    alert("Parsing failed on page " + processPageIdx + ": " + pageErr.message);
                }
            }).catch(pageLoadErr => {
                // Catches pdf.getPage() itself rejecting - also previously unhandled.
                console.error("getPage failed on page " + processPageIdx, pageLoadErr);
                document.getElementById('statusMessage').innerHTML =
                    `<span class='msg-err'>❌ Could not load page ${processPageIdx}: ${pageLoadErr.message}</span>`;
                alert("Could not load page " + processPageIdx + ": " + pageLoadErr.message);
            });
        } else {
            finalizeParsing();
        }
    }
    processNextPageChunk();
}

function finalizeParsing() {
    if (extractedManifests.length > 0) {
        applyAirportStaffToManifests();

        extractedManifests.forEach(manifest => {
            manifest.stops.sort((a, b) => a.pickupTime.localeCompare(b.pickupTime));
            if (manifest.stops.length > 0) {
                manifest.sortTime = manifest.stops[0].pickupTime;
            } else {
                manifest.sortTime = "23:59";
            }
        });

        extractedManifests.sort((a, b) => a.sortTime.localeCompare(b.sortTime));

        updateDateDropdownOptions();
        document.getElementById('searchInput').disabled = false;
        document.getElementById('statusMessage').classList.add('hidden');
        setActiveTab(activeTransferTab);
    }
}

function parseTopDownSequentialLayout(items, transferType) {
    let lineMap = {};
    items.forEach(item => {
        let key = Math.round(item.y);
        let foundKey = Object.keys(lineMap).find(k => Math.abs(k - key) <= 6);
        if (foundKey) {
            lineMap[foundKey].push(item);
        } else {
            lineMap[key] = [item];
        }
    });

    let sortedYKeys = Object.keys(lineMap).sort((a, b) => b - a);
    let processedLines = sortedYKeys.map(key => {
        let rowItems = lineMap[key].sort((a, b) => a.x - b.x);
        return {
            y: parseFloat(key),
            text: rowItems.map(it => it.text).join(" "),
            rawItems: rowItems
        };
    });

    // Locate the Ad. / Ch. / Inf. column x-positions from the header row so passenger
    // counts can be read by column position instead of assuming a fixed token order -
    // blank Ch./Inf. cells mean the numbers that do appear on a row aren't reliably
    // in Ad -> Ch -> Inf order.
    let adColX = null, chColX = null, infColX = null;
    processedLines.forEach(hLine => {
        if (/Ad\.?\s*Ch\.?\s*Inf\.?/i.test(hLine.text)) {
            hLine.rawItems.forEach(hItem => {
                const t = hItem.text.replace(/\./g, '').trim().toLowerCase();
                if (t === 'ad') adColX = hItem.x;
                else if (t === 'ch') chColX = hItem.x;
                else if (t === 'inf') infColX = hItem.x;
            });
        }
    });

    let globalVoucherNo = "N/A";
    let flightCode = "N/A";
    let masterFlightTime = "00:00";
    let manifestDate = "N/A";
    let driverPhone = "";
    let driverName = "";
    let defaultHeaderSupplier = "EASYJET HOLIDAYS";
    let vehicleType = "Coaches Transfer";
    let prefixCategory = "COACH";

    processedLines.forEach(line => {
        if (line.text.includes("Voucher No.")) {
            const vMatch = line.text.match(/Voucher No\.\s*(\d+)/) || line.text.match(/No\.\s*(\d+)/);
            if (vMatch) globalVoucherNo = vMatch[1];
        }

        if (line.text.includes("Date")) {
            const dMatch = line.text.match(/Date\s*(\d{2}[\/\.-]\d{2}[\/\.-]\d{2,4})/i) || line.text.match(/(\d{2}[\/\.-]\d{2}[\/\.-]\d{2,4})/);
            if (dMatch) {
                manifestDate = dMatch[1];
            }
        }

        if (line.text.includes("Vehicle")) {
            const vehMatch = line.text.match(/Vehicle\s+(.+)/i);
            if (vehMatch) {
                let extractedVehicle = vehMatch[1].trim();
                if (extractedVehicle) vehicleType = extractedVehicle;
            }
        }

        if (line.text.includes("Flight")) {
            const fMatch = line.text.match(/Flight\s+([A-Z0-9]{2,4}\d{1,4})/i);
            if (fMatch) {
                flightCode = fMatch[1].toUpperCase();
            } else {
                let tokens = line.text.split(/\s+/);
                let flightIdx = tokens.findIndex(t => t.toLowerCase() === "flight");
                if (flightIdx !== -1 && flightIdx + 1 < tokens.length) {
                    let candidate = tokens[flightIdx + 1].toUpperCase();
                    if (/^[A-Z0-9]{2,4}\d{1,4}$/.test(candidate) && !/^\d{6,}$/.test(candidate)) {
                        flightCode = candidate;
                    }
                }
            }

            const tMatch = line.text.match(/Time\s+(\d{2}:\d{2})/i) || line.text.match(/(\d{2}:\d{2})/);
            if (tMatch) masterFlightTime = tMatch[1];
        }

        if (line.text.includes("Transport")) {
            const tMatch = line.text.match(/Transport\s+([A-Z0-9]+)/i);
            if (tMatch) {
                const transportCode = tMatch[1].toUpperCase();
                if (transportCode.startsWith("ST")) {
                    defaultHeaderSupplier = "Stavrakis Taxi";
                    if (vehicleType === "Coaches Transfer") vehicleType = "Taxi Transfer";
                    driverPhone = "24102297";
                    prefixCategory = "TAXI";
                } else if (transportCode.startsWith("AP")) {
                    defaultHeaderSupplier = "Aphrodite Taxi";
                    if (vehicleType === "Coaches Transfer") vehicleType = "Taxi Transfer";
                    driverPhone = "26934555";
                    prefixCategory = "TAXI";
                } else if (transportCode.startsWith("XC")) {
                    if (vehicleType === "Coaches Transfer") vehicleType = "Shuttle Transfer";
                    prefixCategory = "SHUTTLE";
                } else if (transportCode.startsWith("NC")) {
                    if (vehicleType === "Coaches Transfer") vehicleType = "Adapted Transfer";
                    driverPhone = "22487308";
                    prefixCategory = "ADAPTED";
                }
            }
        }
    });

    if (globalVoucherNo !== "N/A" && excelDriversMap[globalVoucherNo]) {
        const matchData = excelDriversMap[globalVoucherNo];
        if (matchData.name) driverName = matchData.name;
        if (matchData.phone) driverPhone = matchData.phone;
    }

    let currentHotelName = "UNKNOWN PROPERTY";
    let currentPickupTime = masterFlightTime;

    for (let i = 0; i < processedLines.length; i++) {
        let line = processedLines[i];
        let lineText = line.text.trim();

        if (/^(MTS SUMMERTIMES|Departure Transfer|Arrival Transfer|Voucher No\.|Date|Flight|Return V\.No\.|Total|\d+\s+\d+\s+\d+\s+=>)/i.test(lineText)) {
            continue;
        }

        let timeMatch = lineText.match(/(\d{2}:\d{2})/);

        let refMatchOnLine = null;
        let allMatches = [...lineText.matchAll(/\b(\d{6,7})\b/g)];
        if (allMatches.length > 0) {
            refMatchOnLine = allMatches[allMatches.length - 1];
        }

        if (!refMatchOnLine && !lineText.includes("Flight") && !lineText.includes("Airp:") && !lineText.includes("Vehicle") && lineText.length > 3) {
            let extractedHotelName = lineText;
            if (timeMatch) {
                extractedHotelName = lineText.replace(timeMatch[1], "");
                currentPickupTime = timeMatch[1];
            } else if (transferType === 'arrival') {
                currentPickupTime = masterFlightTime;
            }

            extractedHotelName = extractedHotelName.replace(/ARRIVAL\s+TRANSFER/i, "")
                .replace(/DEPARTURE\s+TRANSFER/i, "")
                .replace(/\b\d{5,6}\b/g, "")
                .trim();

            if (extractedHotelName.length > 2 && !/^(Lead Name|Ad\.|Ch\.|Inf\.|Remarks|Fax)$/i.test(extractedHotelName)) {
                currentHotelName = extractedHotelName;
            }
            continue;
        }

        if (refMatchOnLine) {
            const refNum = refMatchOnLine[1];
            let passengerOperator = defaultHeaderSupplier;

            const upperPassengerRowText = lineText.toUpperCase();
            const matchedOperator = resolveOperatorFromText(upperPassengerRowText);
            if (matchedOperator) passengerOperator = matchedOperator;

            let clientPhone = "";
            let leadName = "PASSENGER RECORD";

            line.rawItems.forEach(item => {
                let cleanDigits = item.text.replace(/\D/g, "");
                if (cleanDigits.length >= 8 && cleanDigits !== refNum) {
                    clientPhone = formatClientPhoneNumber(item.text);
                }
            });

            // Match each 1-2 digit token on the row to its nearest Ad./Ch./Inf.
            // header column by x-position, since blank cells mean the tokens that
            // do appear on a row aren't reliably in Ad -> Ch -> Inf order.
            let numericTokensOnRow = [];
            line.rawItems.forEach(item => {
                let rawStr = item.text.trim();
                if (/^\d{1,2}$/.test(rawStr) && parseInt(rawStr, 10) !== parseInt(refNum, 10)) {
                    numericTokensOnRow.push({ value: parseInt(rawStr, 10), x: item.x });
                }
            });

            let adultsCount = 0, childrenCount = 0, infantsCount = 0;
            const hasColumnLayout = (adColX !== null || chColX !== null || infColX !== null);

            if (hasColumnLayout) {
                numericTokensOnRow.forEach(tok => {
                    let candidates = [];
                    if (adColX !== null) candidates.push({ col: 'ad', d: Math.abs(tok.x - adColX) });
                    if (chColX !== null) candidates.push({ col: 'ch', d: Math.abs(tok.x - chColX) });
                    if (infColX !== null) candidates.push({ col: 'inf', d: Math.abs(tok.x - infColX) });
                    candidates.sort((a, b) => a.d - b.d);
                    const nearest = candidates[0];
                    if (nearest && nearest.d < 20) {
                        if (nearest.col === 'ad') adultsCount += tok.value;
                        else if (nearest.col === 'ch') childrenCount += tok.value;
                        else if (nearest.col === 'inf') infantsCount += tok.value;
                    }
                });
            } else {
                // Fallback if the Ad./Ch./Inf. header wasn't found on this page
                let fallbackToken = numericTokensOnRow.find(t => t.value > 0 && t.value < 25);
                if (fallbackToken) adultsCount = fallbackToken.value;
            }

            let calculatedPaxTotal = adultsCount + childrenCount + infantsCount;
            if (calculatedPaxTotal === 0) calculatedPaxTotal = 1;

            let wordsArray = lineText.split(/\s+/);
            for (let k = 0; k < wordsArray.length; k++) {
                let token = wordsArray[k];
                if (/[A-Za-z]/.test(token) && !token.includes("LH") && !token.includes("FR") && !token.includes("EZY") && !token.includes("EASYJET") && !token.includes("HOLI") && !/^[A-Za-z]{1,4}\d+/i.test(token) && token.length > 1) {
                    leadName = token;
                    break;
                }
            }

            let manifestGroupKey = (globalVoucherNo !== "N/A" ? globalVoucherNo : flightCode).toLowerCase().replace(/\s+/g, "");
            let targetManifest = extractedManifests.find(m => m.groupKey === manifestGroupKey && m.type === transferType && m.manifestDate === manifestDate);

            if (!targetManifest) {
                targetManifest = {
                    groupKey: manifestGroupKey,
                    type: transferType,
                    voucherId: globalVoucherNo,
                    manifestDate: manifestDate,
                    busSupplier: defaultHeaderSupplier,
                    vehicle: vehicleType,
                    prefixCategory: prefixCategory,
                    flight: flightCode,
                    routeTime: masterFlightTime,
                    sortTime: currentPickupTime,
                    driverPhone: driverPhone,
                    driverName: driverName,
                    airportStaff: "",
                    stops: [],
                    searchString: ""
                };
                extractedManifests.push(targetManifest);
            }

            let targetStop = targetManifest.stops.find(s => s.hotelName === currentHotelName);
            if (!targetStop) {
                targetStop = {
                    hotelName: currentHotelName,
                    pickupTime: currentPickupTime,
                    passengers: []
                };
                targetManifest.stops.push(targetStop);
            }

            if (!targetStop.passengers.some(p => p.refNum === refNum)) {
                targetStop.passengers.push({
                    leadName: leadName.toUpperCase(),
                    refNum: refNum,
                    paxCount: calculatedPaxTotal,
                    adults: adultsCount,
                    children: childrenCount,
                    infants: infantsCount,
                    clientPhone: clientPhone,
                    operator: passengerOperator
                });
                targetManifest.searchString += ` ${leadName} ${refNum} ${currentHotelName} ${passengerOperator} ${manifestDate}`.toLowerCase();
            }
        }
    }
}

function renderManifestCards() {
    const query = document.getElementById('searchInput').value.trim();
    const lowerQuery = query.toLowerCase();
    const container = document.getElementById('manifestsContainer');
    container.innerHTML = '';

    let visibleCount = 0;

    extractedManifests.forEach((manifest, index) => {
        if (manifest.type !== activeTransferTab) return;
        if (activePrefixTab !== 'ALL' && manifest.prefixCategory !== activePrefixTab) return;
        if (activeDateFilter !== 'ALL' && manifest.manifestDate !== activeDateFilter) return;

        if (activeOperatorFilter !== 'ALL') {
            let hasMatchingOp = manifest.stops.some(stop =>
                stop.passengers.some(p => p.operator && p.operator.toUpperCase() === activeOperatorFilter.toUpperCase())
            );
            if (!hasMatchingOp) return;
        }

        if (lowerQuery && !manifest.searchString.includes(lowerQuery) && !manifest.flight.toLowerCase().includes(lowerQuery) && !manifest.voucherId.toLowerCase().includes(lowerQuery)) return;

        visibleCount++;

        const accentIdx = hashStringToIndex(`${manifest.groupKey}|${manifest.manifestDate}|${manifest.type}`, VOUCHER_ACCENT_PALETTE.length);
        const accent = VOUCHER_ACCENT_PALETTE[accentIdx];

        const manifestBlock = document.createElement('div');
        manifestBlock.className = `voucher-card ${accent}`;

        const contentBlockId = `voucher-body-${index}`;
        const arrowIconId = `voucher-arrow-${index}`;

        let manifestOperatorsSet = new Set();

        let stopsHtml = '';
        manifest.stops.forEach((stop, stopIndex) => {
            let passengersHtml = '';

            stop.passengers.forEach(p => {
                if (activeOperatorFilter !== 'ALL' && p.operator && p.operator.toUpperCase() !== activeOperatorFilter.toUpperCase()) {
                    return;
                }

                const matchesName = p.leadName.toLowerCase().includes(lowerQuery);
                const matchesRef = p.refNum.toLowerCase().includes(lowerQuery);
                const matchesHotel = stop.hotelName.toLowerCase().includes(lowerQuery);
                const matchesOp = p.operator ? p.operator.toLowerCase().includes(lowerQuery) : false;
                const matchesStaff = manifest.airportStaff ? manifest.airportStaff.toLowerCase().includes(lowerQuery) : false;

                if (lowerQuery && !matchesName && !matchesRef && !matchesHotel && !matchesOp && !matchesStaff) return;

                if (p.operator) manifestOperatorsSet.add(p.operator);

                const safeRef = String(p.refNum).replace(/'/g, "\\'");
                const highlightedName = highlightText(p.leadName, query);
                const highlightedRef = highlightText(p.refNum, query);
                const highlightedOp = p.operator ? highlightText(p.operator, query) : "";

                let communicationButtonsHtml = "";
                if (p.clientPhone) {
                    let dialDestination = `tel:${p.clientPhone}`;
                    let cleanNumber = p.clientPhone.startsWith("00") ? p.clientPhone.replace(/^00/, "+") : p.clientPhone;
                    if (!cleanNumber.startsWith("+") && cleanNumber.length > 6) {
                        cleanNumber = "+" + cleanNumber;
                    }
                    let whatsappLink = `https://wa.me/${cleanNumber}`;
                    const safeJSName = p.leadName.replace(/'/g, "\\'");

                    communicationButtonsHtml = `
                        <a href="${dialDestination}" onclick="handleContactClick(event, '${safeJSName}', '${p.clientPhone}', 'tel')" title="Cellular Dial" class="icon-btn icon-call">📞</a>
                        <a href="${whatsappLink}" onclick="handleContactClick(event, '${safeJSName}', '${p.clientPhone}', 'whatsapp')" title="WhatsApp Call" class="icon-btn icon-wa">💬</a>
                    `;
                }

                passengersHtml += `
                    <div class="passenger-row">
                        <div class="pax-line">
                            <span class="pax-name">${highlightedName}</span>
                            <div class="pax-actions">
                                <button onclick="handleSystemRedirect('${safeRef}', '${COMMENTS_SYSTEM_STATIC_URL}')" aria-label="Notes" title="Notes" class="icon-btn">📝</button>
                                ${communicationButtonsHtml}
                                <button onclick="handleSystemRedirect('${safeRef}', '${GPS_SYSTEM_STATIC_URL}')" aria-label="Track" title="Track" class="icon-btn">🚌</button>
                            </div>
                        </div>
                        <div class="pax-tags">
                            <span class="tag-ref">Ref: <span class="ref-chip">${highlightedRef}</span></span>
                            <span class="tag-op">${highlightedOp}</span>
                            <span class="tag-pax" title="Adults: ${p.adults} · Children: ${p.children} · Infants: ${p.infants}">PAX: ${p.paxCount} (Ad:${p.adults} Ch:${p.children} Inf:${p.infants})</span>
                        </div>
                    </div>
                `;
            });

            if (!passengersHtml) return;

            const highlightedHotel = highlightText(stop.hotelName, query);
            const timingLabel = manifest.type === 'arrival' ? 'Arr' : 'P/U';

            let receptionCallHtml = "";
            const normalizedHotelKey = stop.hotelName.toUpperCase().trim();

            let matchedKey = Object.keys(HOTEL_DIRECTORY).find(k => normalizedHotelKey.includes(k) || k.includes(normalizedHotelKey));
            if (matchedKey) {
                const recNum = HOTEL_DIRECTORY[matchedKey];
                receptionCallHtml = `
                    <a href="tel:${recNum}" onclick="handleContactClick(event, 'RECEPTION', '${recNum}', 'tel')" class="reception-link">
                        📞 Reception (${recNum})
                    </a>
                `;
            }

            stopsHtml += `
                <div class="stop-block">
                    <div class="stop-head">
                        <div class="stop-head-left">
                            <span class="stop-no">Stop ${stopIndex + 1}</span>
                            <span class="stop-hotel">${highlightedHotel}</span>
                        </div>
                        <div class="stop-head-right">
                            ${receptionCallHtml}
                            <span class="time-chip">🕒 ${timingLabel}: ${stop.pickupTime}</span>
                        </div>
                    </div>
                    <div class="passengers">
                        ${passengersHtml}
                    </div>
                </div>
            `;
        });

        if (!stopsHtml) return;

        let headerSupplierTitle = manifest.busSupplier;
        let operatorsArray = Array.from(manifestOperatorsSet);
        if (operatorsArray.length === 1) {
            headerSupplierTitle = operatorsArray[0];
        } else if (operatorsArray.length > 1) {
            headerSupplierTitle = operatorsArray.join(" / ");
        }

        const highlightedSupplier = highlightText(headerSupplierTitle, query);
        const highlightedFlight = highlightText(manifest.flight, query);
        const displayVoucher = manifest.voucherId !== "N/A" ? manifest.voucherId : "Run";
        const displayDate = manifest.manifestDate !== "N/A" ? manifest.manifestDate : "";

        let staffBadgeHtml = "";
        if (manifest.airportStaff) {
            const highlightedStaff = highlightText(manifest.airportStaff, query);
            staffBadgeHtml = `
                <span class="rep-badge">👤 REP: ${highlightedStaff}</span>
            `;
        }

        let driverDialDestination = manifest.driverPhone ? `tel:${manifest.driverPhone}` : `tel:0035799000000`;
        let driverButtonLabel = manifest.driverPhone
            ? (manifest.driverName ? `📞 ${manifest.driverName} (${manifest.driverPhone})` : `📞 Driver (${manifest.driverPhone})`)
            : `⚠️ No Driver`;
        let driverClass = manifest.driverPhone ? 'driver-btn' : 'driver-btn-empty';

        const safeDriverName = manifest.driverName ? manifest.driverName.replace(/'/g, "\\'") : "DRIVER";
        const safeDriverPhone = manifest.driverPhone ? manifest.driverPhone : "0035799000000";

        manifestBlock.innerHTML = `
            <div class="voucher-head" onclick="toggleVoucherCollapse('${contentBlockId}', '${arrowIconId}')">
                <div class="voucher-head-left">
                    <span id="${arrowIconId}" class="voucher-arrow">▲</span>
                    <div class="vou-meta">
                        <span class="vou-label">Voucher:</span>
                        <span onclick="event.stopPropagation(); showFullVoucherModal(${index})" title="Tap to view the full voucher" class="vou-badge">${displayVoucher}</span>
                    </div>
                    ${displayDate ? `<span class="date-badge">📅 ${displayDate}</span>` : ''}
                    <div class="vou-meta">
                        <span class="vou-supplier">${highlightedSupplier}</span>
                        <span class="vou-sep">|</span>
                        <span class="vou-vehicle">${manifest.vehicle}</span>
                    </div>
                </div>
                <div class="voucher-head-right" onclick="event.stopPropagation()">
                    ${staffBadgeHtml}
                    <span class="flight-badge">FLIGHT: ${highlightedFlight}</span>
                    <a href="${driverDialDestination}" onclick="handleContactClick(event, '${safeDriverName}', '${safeDriverPhone}', 'tel')" class="${driverClass}">
                        ${driverButtonLabel}
                    </a>
                </div>
            </div>
            <div id="${contentBlockId}" class="voucher-body">
                ${stopsHtml}
            </div>
        `;

        container.appendChild(manifestBlock);
    });

    if (visibleCount === 0) {
        container.innerHTML = `<div class="empty-note">No active transfers match your current filter selection.</div>`;
    }
}

function toggleVoucherCollapse(bodyId, arrowId) {
    const bodyNode = document.getElementById(bodyId);
    const arrowNode = document.getElementById(arrowId);

    if (bodyNode.classList.contains('closed')) {
        bodyNode.classList.remove('closed');
        arrowNode.classList.remove('closed');
    } else {
        bodyNode.classList.add('closed');
        arrowNode.classList.add('closed');
    }
}

function showFullVoucherModal(index) {
    const manifest = extractedManifests[index];
    if (!manifest) return;

    const accentIdx = hashStringToIndex(`${manifest.groupKey}|${manifest.manifestDate}|${manifest.type}`, VOUCHER_ACCENT_PALETTE.length);
    const accent = VOUCHER_ACCENT_PALETTE[accentIdx];

    let manifestOperatorsSet = new Set();
    let stopsHtml = '';

    manifest.stops.forEach((stop, stopIndex) => {
        let passengersHtml = '';

        stop.passengers.forEach(p => {
            if (p.operator) manifestOperatorsSet.add(p.operator);

            const safeRef = String(p.refNum).replace(/'/g, "\\'");
            let communicationButtonsHtml = "";
            if (p.clientPhone) {
                let dialDestination = `tel:${p.clientPhone}`;
                let cleanNumber = p.clientPhone.startsWith("00") ? p.clientPhone.replace(/^00/, "+") : p.clientPhone;
                if (!cleanNumber.startsWith("+") && cleanNumber.length > 6) {
                    cleanNumber = "+" + cleanNumber;
                }
                let whatsappLink = `https://wa.me/${cleanNumber}`;
                const safeJSName = p.leadName.replace(/'/g, "\\'");

                communicationButtonsHtml = `
                    <a href="${dialDestination}" onclick="handleContactClick(event, '${safeJSName}', '${p.clientPhone}', 'tel')" title="Cellular Dial" class="icon-btn icon-call">📞</a>
                    <a href="${whatsappLink}" onclick="handleContactClick(event, '${safeJSName}', '${p.clientPhone}', 'whatsapp')" title="WhatsApp Call" class="icon-btn icon-wa">💬</a>
                `;
            }

            passengersHtml += `
                <div class="passenger-row">
                    <div class="pax-line">
                        <span class="pax-name">${p.leadName}</span>
                        <div class="pax-actions">
                            <button onclick="handleSystemRedirect('${safeRef}', '${COMMENTS_SYSTEM_STATIC_URL}')" aria-label="Notes" title="Notes" class="icon-btn">📝</button>
                            ${communicationButtonsHtml}
                            <button onclick="handleSystemRedirect('${safeRef}', '${GPS_SYSTEM_STATIC_URL}')" aria-label="Track" title="Track" class="icon-btn">🚌</button>
                        </div>
                    </div>
                    <div class="pax-tags">
                        <span class="tag-ref">Ref: <span class="ref-chip">${p.refNum}</span></span>
                        <span class="tag-op">${p.operator || ''}</span>
                        <span class="tag-pax" title="Adults: ${p.adults} · Children: ${p.children} · Infants: ${p.infants}">PAX: ${p.paxCount} (Ad:${p.adults} Ch:${p.children} Inf:${p.infants})</span>
                    </div>
                </div>
            `;
        });

        const timingLabel = manifest.type === 'arrival' ? 'Arr' : 'P/U';
        let receptionCallHtml = "";
        const normalizedHotelKey = stop.hotelName.toUpperCase().trim();
        let matchedKey = Object.keys(HOTEL_DIRECTORY).find(k => normalizedHotelKey.includes(k) || k.includes(normalizedHotelKey));
        if (matchedKey) {
            const recNum = HOTEL_DIRECTORY[matchedKey];
            receptionCallHtml = `
                <a href="tel:${recNum}" onclick="handleContactClick(event, 'RECEPTION', '${recNum}', 'tel')" class="reception-link">
                    📞 Reception (${recNum})
                </a>
            `;
        }

        stopsHtml += `
            <div class="stop-block">
                <div class="stop-head">
                    <div class="stop-head-left">
                        <span class="stop-no">Stop ${stopIndex + 1}</span>
                        <span class="stop-hotel">${stop.hotelName}</span>
                    </div>
                    <div class="stop-head-right">
                        ${receptionCallHtml}
                        <span class="time-chip">🕒 ${timingLabel}: ${stop.pickupTime}</span>
                    </div>
                </div>
                <div class="passengers">
                    ${passengersHtml}
                </div>
            </div>
        `;
    });

    let headerSupplierTitle = manifest.busSupplier;
    let operatorsArray = Array.from(manifestOperatorsSet);
    if (operatorsArray.length === 1) {
        headerSupplierTitle = operatorsArray[0];
    } else if (operatorsArray.length > 1) {
        headerSupplierTitle = operatorsArray.join(" / ");
    }

    const displayVoucher = manifest.voucherId !== "N/A" ? manifest.voucherId : "Run";
    const displayDate = manifest.manifestDate !== "N/A" ? manifest.manifestDate : "";

    let staffBadgeHtml = "";
    if (manifest.airportStaff) {
        staffBadgeHtml = `<span class="rep-badge">👤 REP: ${manifest.airportStaff}</span>`;
    }

    let driverDialDestination = manifest.driverPhone ? `tel:${manifest.driverPhone}` : `tel:0035799000000`;
    let driverButtonLabel = manifest.driverPhone
        ? (manifest.driverName ? `📞 ${manifest.driverName} (${manifest.driverPhone})` : `📞 Driver (${manifest.driverPhone})`)
        : `⚠️ No Driver`;
    let driverClass = manifest.driverPhone ? 'driver-btn' : 'driver-btn-empty';
    const safeDriverName = manifest.driverName ? manifest.driverName.replace(/'/g, "\\'") : "DRIVER";
    const safeDriverPhone = manifest.driverPhone ? manifest.driverPhone : "0035799000000";

    document.getElementById('fullVoucherModalBody').innerHTML = `
        <div class="modal-voucher-summary ${accent}">
            <div class="voucher-head-left">
                <span class="vou-dot"></span>
                <span class="vou-label">Voucher:</span>
                <span class="vou-badge">${displayVoucher}</span>
                ${displayDate ? `<span class="date-badge">📅 ${displayDate}</span>` : ''}
                <span class="vou-supplier">${headerSupplierTitle}</span>
                <span class="vou-sep">|</span>
                <span class="vou-vehicle">${manifest.vehicle}</span>
            </div>
            <div class="voucher-head-right">
                ${staffBadgeHtml}
                <span class="flight-badge">FLIGHT: ${manifest.flight}</span>
                <a href="${driverDialDestination}" onclick="handleContactClick(event, '${safeDriverName}', '${safeDriverPhone}', 'tel')" class="${driverClass}">
                    ${driverButtonLabel}
                </a>
            </div>
        </div>
        ${stopsHtml}
    `;

    document.getElementById('fullVoucherModal').classList.remove('hidden');
}

function closeFullVoucherModal(event) {
    document.getElementById('fullVoucherModal').classList.add('hidden');
}
