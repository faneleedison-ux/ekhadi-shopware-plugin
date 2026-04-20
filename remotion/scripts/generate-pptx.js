#!/usr/bin/env node
/**
 * e-Khadi — Huawei Developer Competition PPTX
 * 14 slides matching the official submission template
 * Usage: node scripts/generate-pptx.js
 * Output: out/ekhadi-competition.pptx
 */

const PptxGenJS = require("pptxgenjs");
const path = require("path");
const fs = require("fs");

const OUT_DIR = path.join(__dirname, "../out");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE"; // 13.33" x 7.5"
pptx.title = "e-Khadi — Huawei Developer Competition Africa";
pptx.subject = "Community Credit & Stokvel Platform";
pptx.author = "Fanelesibonge Mbuyazi";

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  bg:        "0A0E1A",
  bgCard:    "111827",
  bgCard2:   "0F172A",
  primary:   "3B82F6",
  accent:    "6366F1",
  sky:       "38BDF8",
  teal:      "2DD4BF",
  green:     "22C55E",
  yellow:    "FBBF24",
  orange:    "F97316",
  red:       "EF4444",
  purple:    "A855F7",
  pink:      "EC4899",
  white:     "FFFFFF",
  text:      "F9FAFB",
  textSub:   "9CA3AF",
  textMuted: "6B7280",
  huawei:    "CF0A2C",  // Huawei red
};

const FONT = "Segoe UI";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function bg(s) {
  s.background = { color: C.bg };
}

function topBar(s, color) {
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.06,
    fill: { color: color || C.primary }, line: { width: 0 },
  });
}

function logo(s) {
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.3, y: 6.96, w: 0.34, h: 0.34,
    fill: { color: C.white }, line: { width: 0 }, rectRadius: 0.06,
  });
  s.addText("eK", {
    x: 0.3, y: 6.96, w: 0.34, h: 0.34,
    fontSize: 9, bold: true, color: C.primary,
    align: "center", valign: "middle", fontFace: FONT,
  });
  s.addText("e-Khadi · Huawei Developer Competition Africa 2026", {
    x: 0.72, y: 6.98, w: 5.5, h: 0.28,
    fontSize: 8, color: C.textMuted, fontFace: FONT,
  });
  // GitHub link on every slide
  s.addText("🐙 github.com/faneleedison-ux/ekhadi-shopware-plugin", {
    x: 6.5, y: 6.98, w: 5.5, h: 0.28,
    fontSize: 8, color: C.primary, align: "right", fontFace: FONT,
    hyperlink: { url: "https://github.com/faneleedison-ux/ekhadi-shopware-plugin" },
  });
}

function slideNum(s, n, total) {
  s.addText(`${n} / ${total}`, {
    x: 12.2, y: 6.98, w: 1, h: 0.28,
    fontSize: 9, color: C.textMuted, align: "right", fontFace: FONT,
  });
}

function heading(s, tag, title, subtitle) {
  if (tag) {
    s.addText(tag.toUpperCase(), {
      x: 0.5, y: 0.28, w: 10, h: 0.28,
      fontSize: 9, bold: true, color: C.primary,
      charSpacing: 4, fontFace: FONT,
    });
  }
  s.addText(title, {
    x: 0.5, y: tag ? 0.55 : 0.28, w: 12.3, h: 0.85,
    fontSize: 38, bold: true, color: C.white,
    fontFace: FONT, charSpacing: -0.5,
  });
  if (subtitle) {
    s.addText(subtitle, {
      x: 0.5, y: tag ? 1.38 : 1.1, w: 12, h: 0.4,
      fontSize: 14, color: C.textSub, fontFace: FONT,
    });
  }
}

function card(s, x, y, w, h, accentColor) {
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    fill: { color: C.bgCard },
    line: { color: accentColor || C.primary, width: 1 },
    rectRadius: 0.14,
  });
}

function tableRow(s, x, y, w, h, label, value, labelColor, isShaded) {
  if (isShaded) {
    s.addShape(pptx.ShapeType.rect, {
      x, y, w, h,
      fill: { color: "161D2E" }, line: { width: 0 },
    });
  }
  s.addText(label, {
    x: x + 0.18, y, w: 2.5, h,
    fontSize: 12, bold: true, color: labelColor || C.primary,
    valign: "middle", fontFace: FONT,
  });
  s.addText(value, {
    x: x + 2.8, y, w: w - 3.0, h,
    fontSize: 12, color: C.text,
    valign: "middle", fontFace: FONT, wrap: true,
  });
  // divider
  s.addShape(pptx.ShapeType.line, {
    x, y: y + h, w, h: 0,
    line: { color: "1E2A3A", width: 0.5 },
  });
}

function bullet(s, x, y, text, color, size) {
  s.addText(`›  ${text}`, {
    x, y, w: 12, h: size ? size * 1.5 / 72 : 0.35,
    fontSize: size || 13, color: color || C.textSub,
    fontFace: FONT, wrap: true,
  });
}

const TOTAL = 16;

const ASSETS = path.join(__dirname, "../../assets/images");
const PROFILE_IMG  = path.join(ASSETS, "profile.jpeg");
const ARCH_CURRENT = path.join(ASSETS, "architecture/current-architecture.jpg");
const ARCH_FUTURE  = path.join(ASSETS, "architecture/future-architecture.jpg");

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — COVER
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  bg(s);
  // Full gradient header band
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 3.2,
    fill: { type: "solid", color: "0D1526" }, line: { width: 0 },
  });
  topBar(s, C.huawei);

  // Huawei red accent line
  s.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.0, w: 0.06, h: 1.6,
    fill: { color: C.huawei }, line: { width: 0 },
  });

  // Logo mark
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.72, y: 1.05, w: 0.9, h: 0.9,
    fill: { color: C.white }, line: { width: 0 }, rectRadius: 0.18,
  });
  s.addText("eK", {
    x: 0.72, y: 1.08, w: 0.9, h: 0.84,
    fontSize: 26, bold: true, color: C.primary,
    align: "center", valign: "middle", fontFace: FONT,
  });

  // Title
  s.addText("e-Khadi", {
    x: 1.75, y: 0.95, w: 11, h: 1.0,
    fontSize: 60, bold: true, color: C.white,
    fontFace: FONT, charSpacing: -1,
  });
  s.addText("Community Credit & Stokvel Platform", {
    x: 1.75, y: 1.95, w: 11, h: 0.55,
    fontSize: 20, color: C.textSub, fontFace: FONT,
  });

  // Info table
  const rows = [
    { label: "Challenge",    value: "Huawei Developer Competition Africa",           color: C.huawei },
    { label: "Project",      value: "e-Khadi — Community Credit & Stokvel Platform", color: C.primary },
    { label: "Team",         value: "e-Khadi",                                       color: C.teal },
    { label: "Organisation", value: "Independent / Sanlam",                          color: C.sky },
    { label: "Contact",      value: "Fanelesibonge.Mbuyazi@sanlam.co.za",            color: C.textSub },
  ];
  const tY = 3.4;
  const rowH = 0.56;
  // Table border
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: tY - 0.05, w: 12.3, h: rows.length * rowH + 0.1,
    fill: { color: C.bgCard }, line: { color: "1E2A3A", width: 1 }, rectRadius: 0.14,
  });
  rows.forEach((r, i) => {
    tableRow(s, 0.5, tY + i * rowH, 12.3, rowH, r.label, r.value, r.color, i % 2 === 1);
  });

  // Links row
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 6.62, w: 12.3, h: 0.55,
    fill: { color: "0D1526" }, line: { color: "1E2A3A", width: 1 }, rectRadius: 0.1,
  });
  // Website
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.65, y: 6.7, w: 4.0, h: 0.38,
    fill: { color: "161D2E" }, line: { color: C.primary, width: 0.8 }, rectRadius: 0.07,
  });
  s.addText("🌐  https://e-khadi.co.za", {
    x: 0.65, y: 6.7, w: 4.0, h: 0.38,
    fontSize: 11, bold: true, color: C.primary, align: "center", valign: "middle", fontFace: FONT,
    hyperlink: { url: "https://e-khadi.co.za" },
  });
  // GitHub
  s.addShape(pptx.ShapeType.roundRect, {
    x: 4.9, y: 6.7, w: 7.8, h: 0.38,
    fill: { color: "161D2E" }, line: { color: C.textMuted, width: 0.8 }, rectRadius: 0.07,
  });
  s.addText("🐙  https://github.com/faneleedison-ux/ekhadi-shopware-plugin", {
    x: 4.9, y: 6.7, w: 7.8, h: 0.38,
    fontSize: 11, color: C.textSub, align: "center", valign: "middle", fontFace: FONT,
    hyperlink: { url: "https://github.com/faneleedison-ux/ekhadi-shopware-plugin" },
  });

  logo(s); slideNum(s, 1, TOTAL);
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — PROJECT OVERVIEW
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  bg(s); topBar(s, C.primary);
  heading(s, "Slide 2", "Project Overview", null);

  const rows = [
    { label: "Project Name",      value: "e-Khadi",                                                                               color: C.primary },
    { label: "Team Name",         value: "e-Khadi",                                                                               color: C.teal },
    { label: "Contacts",          value: "Fanelesibonge Mbuyazi  ·  Fanelesibonge.Mbuyazi@sanlam.co.za",                          color: C.sky },
    { label: "Technical Field",   value: "PaaS, Database, Serverless, Cloud Storage",                                             color: C.accent },
    { label: "Technologies",      value: "Next.js 14, Prisma ORM, PostgreSQL, ECS, RDS, OBS, SMN, FunctionGraph",                 color: C.purple },
    { label: "Keywords",          value: "SASSA grants · store credit · stokvel · fintech · financial inclusion · South Africa",  color: C.yellow },
    { label: "Applicable Fields", value: "Financial Services · Social Welfare · Community Retail",                                color: C.green },
  ];

  const tY = 1.85;
  const rowH = 0.54;
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: tY - 0.05, w: 12.3, h: rows.length * rowH + 0.1,
    fill: { color: C.bgCard }, line: { color: "1E2A3A", width: 1 }, rectRadius: 0.14,
  });
  rows.forEach((r, i) => {
    tableRow(s, 0.5, tY + i * rowH, 12.3, rowH, r.label, r.value, r.color, i % 2 === 1);
  });

  // Description box
  const descY = tY + rows.length * rowH + 0.2;
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: descY, w: 12.3, h: 1.5,
    fill: { color: C.bgCard2 }, line: { color: C.primary, width: 1 }, rectRadius: 0.14,
  });
  s.addText("Description", {
    x: 0.7, y: descY + 0.1, w: 3, h: 0.28,
    fontSize: 10, bold: true, color: C.primary, fontFace: FONT, charSpacing: 2,
  });
  s.addText(
    "e-Khadi is a community credit and stokvel management platform built for South Africa's 18 million+ SASSA grant recipients. Township communities rely on spaza shops as their primary retail touchpoint, but there is no digital credit infrastructure connecting them. e-Khadi digitises this ecosystem: shop owners offer store credit to community members, who repay from their monthly SASSA grants. Built on Huawei Cloud — ECS, RDS, OBS, SMN, FunctionGraph. Innovations include AI stock forecasting, QR payments, loyalty rewards, 2% auto-emergency savings, fraud detection, bulk buying, and a financial literacy chatbot. Live at https://e-khadi.co.za",
    {
      x: 0.7, y: descY + 0.38, w: 11.9, h: 1.02,
      fontSize: 10.5, color: C.textSub, fontFace: FONT, wrap: true,
    }
  );

  logo(s); slideNum(s, 2, TOTAL);
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — TABLE OF CONTENTS
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  bg(s); topBar(s, C.accent);
  heading(s, "Slide 3", "Contents", "What we will cover");

  const items = [
    { n: "01", title: "Team Introduction",        color: C.sky },
    { n: "02", title: "Project Introduction",     color: C.teal },
    { n: "03", title: "Technical Architecture",   color: C.primary },
    { n: "04", title: "Functions",                color: C.purple },
    { n: "05", title: "Innovations",              color: C.yellow },
    { n: "06", title: "Business Value",           color: C.green },
    { n: "07", title: "Demo & Follow-up Plan",    color: C.orange },
    { n: "08", title: "Achievements",             color: C.pink },
  ];

  items.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.5 + col * 6.4;
    const y = 1.9 + row * 1.2;

    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 6.1, h: 0.95,
      fill: { color: C.bgCard }, line: { color: item.color, width: 1 }, rectRadius: 0.12,
    });
    s.addText(item.n, {
      x: x + 0.18, y, w: 0.7, h: 0.95,
      fontSize: 22, bold: true, color: item.color,
      valign: "middle", fontFace: FONT,
    });
    s.addShape(pptx.ShapeType.line, {
      x: x + 0.85, y: y + 0.2, w: 0, h: 0.55,
      line: { color: item.color, width: 1 },
    });
    s.addText(item.title, {
      x: x + 1.05, y, w: 4.85, h: 0.95,
      fontSize: 16, bold: true, color: C.text,
      valign: "middle", fontFace: FONT,
    });
  });

  logo(s); slideNum(s, 3, TOTAL);
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 4 — TEAM INTRODUCTION
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  bg(s); topBar(s, C.sky);
  heading(s, "Slide 4", "Team Introduction", "The person behind e-Khadi");

  // Profile photo
  s.addShape(pptx.ShapeType.ellipse, {
    x: 0.46, y: 1.81, w: 2.28, h: 2.28,
    fill: { color: C.primary }, line: { color: C.primary, width: 2.5 },
  });
  s.addImage({ path: PROFILE_IMG, x: 0.5, y: 1.85, w: 2.2, h: 2.2, rounding: true });
  s.addText("Fanelesibonge Mbuyazi", {
    x: 0.5, y: 4.12, w: 2.2, h: 0.4,
    fontSize: 10, bold: true, color: C.sky, align: "center", fontFace: FONT,
  });
  s.addText("Full-Stack Developer · Project Lead", {
    x: 0.5, y: 4.5, w: 2.2, h: 0.32,
    fontSize: 8, color: C.textMuted, align: "center", fontFace: FONT,
  });

  // Info card
  const rows = [
    { label: "Name",       value: "Fanelesibonge Mbuyazi",                                                     color: C.sky },
    { label: "Role",       value: "Full-Stack Developer · Project Lead",                                       color: C.primary },
    { label: "Education",  value: "Bachelor of Commerce in Information Systems — University of KwaZulu-Natal",  color: C.teal },
    { label: "Experience", value: "Software Engineer at Sanlam · Building fintech solutions for underserved South African communities", color: C.green },
    { label: "Contact",    value: "Fanelesibonge.Mbuyazi@sanlam.co.za",                                        color: C.textMuted },
  ];

  const tX = 3.0;
  const tY = 1.85;
  const rowH = 0.62;
  s.addShape(pptx.ShapeType.roundRect, {
    x: tX, y: tY, w: 9.8, h: rows.length * rowH + 0.05,
    fill: { color: C.bgCard }, line: { color: "1E2A3A", width: 1 }, rectRadius: 0.14,
  });
  rows.forEach((r, i) => {
    tableRow(s, tX, tY + i * rowH, 9.8, rowH, r.label, r.value, r.color, i % 2 === 1);
  });

  // Huawei skills strip
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 5.95, w: 12.3, h: 0.7,
    fill: { color: C.bgCard2 }, line: { color: C.primary, width: 1 }, rectRadius: 0.1,
  });
  s.addText("Huawei Cloud Skills:", {
    x: 0.7, y: 5.95, w: 2.2, h: 0.7,
    fontSize: 11, bold: true, color: C.primary, valign: "middle", fontFace: FONT,
  });
  ["ECS", "RDS", "OBS", "SMN", "FunctionGraph", "Next.js", "Prisma ORM", "PostgreSQL"].forEach((skill, i) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x: 3.0 + i * 1.16, y: 6.1, w: 1.08, h: 0.42,
      fill: { color: "1E2A3A" }, line: { color: C.primary, width: 0.8 }, rectRadius: 0.08,
    });
    s.addText(skill, {
      x: 3.0 + i * 1.16, y: 6.1, w: 1.08, h: 0.42,
      fontSize: 9, color: C.sky, align: "center", valign: "middle", fontFace: FONT,
    });
  });

  logo(s); slideNum(s, 4, TOTAL);
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 5 — PROJECT INTRODUCTION
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  bg(s); topBar(s, C.teal);
  heading(s, "Slide 5", "Project Introduction", "The problem e-Khadi solves");

  const sections = [
    {
      icon: "🌍", title: "Background", color: C.teal,
      text: "18M+ South Africans receive SASSA grants monthly. Most live in townships with no formal banking. Spaza shops are the main retail touchpoint but run entirely on cash with no digital records — leading to disputes, defaults, and zero savings.",
    },
    {
      icon: "🔧", title: "Problems Solved", color: C.orange,
      items: ["Financial exclusion from the formal economy", "Manual, paper-based credit record-keeping", "Credit defaults with no recourse", "No savings or stokvel management infrastructure"],
    },
    {
      icon: "👥", title: "Target Users", color: C.primary,
      items: ["SASSA grant recipients (members)", "Spaza shop owners", "Stokvel savings group coordinators"],
    },
    {
      icon: "📍", title: "Application Scenarios", color: C.purple,
      text: "Any South African township community where a shop owner personally knows their customers — Soweto, Khayelitsha, Umlazi, and thousands more. Designed for low-data mobile use.",
    },
  ];

  sections.forEach((sec, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.5 + col * 6.4;
    const y = 1.85 + row * 2.45;

    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 6.1, h: 2.25,
      fill: { color: C.bgCard }, line: { color: sec.color, width: 1 }, rectRadius: 0.14,
    });
    s.addText(`${sec.icon}  ${sec.title}`, {
      x: x + 0.2, y: y + 0.15, w: 5.7, h: 0.4,
      fontSize: 14, bold: true, color: sec.color, fontFace: FONT,
    });
    s.addShape(pptx.ShapeType.line, {
      x: x + 0.2, y: y + 0.58, w: 5.7, h: 0,
      line: { color: sec.color, width: 0.5 },
    });

    if (sec.text) {
      s.addText(sec.text, {
        x: x + 0.2, y: y + 0.68, w: 5.7, h: 1.45,
        fontSize: 10.5, color: C.textSub, fontFace: FONT, wrap: true,
      });
    } else if (sec.items) {
      sec.items.forEach((item, ii) => {
        s.addText(`›  ${item}`, {
          x: x + 0.2, y: y + 0.68 + ii * 0.36, w: 5.7, h: 0.35,
          fontSize: 10.5, color: C.textSub, fontFace: FONT,
        });
      });
    }
  });

  logo(s); slideNum(s, 5, TOTAL);
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 6 — TECHNICAL ARCHITECTURE OVERVIEW
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  bg(s); topBar(s, C.primary);
  heading(s, "Slide 6", "Technical Architecture", "Stack and Huawei Cloud services");

  // Left column — stack
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 1.75, w: 5.8, h: 5.0,
    fill: { color: C.bgCard }, line: { color: C.primary, width: 1 }, rectRadius: 0.14,
  });
  s.addText("Application Stack", {
    x: 0.7, y: 1.9, w: 5.4, h: 0.38,
    fontSize: 14, bold: true, color: C.primary, fontFace: FONT,
  });

  const stack = [
    { layer: "Frontend",  value: "Next.js 14 App Router · TypeScript · Tailwind CSS · PWA",    color: C.sky },
    { layer: "Backend",   value: "Next.js API Routes · NextAuth.js · Prisma ORM",               color: C.teal },
    { layer: "Database",  value: "PostgreSQL via Huawei RDS (private network 192.168.0.53)",    color: C.green },
    { layer: "Auth",      value: "Role-based: ADMIN / MEMBER / SHOP — JWT sessions",            color: C.purple },
    { layer: "Deploy",    value: "PM2 process manager · Nginx reverse proxy · e-khadi.co.za",  color: C.orange },
  ];
  stack.forEach((item, i) => {
    s.addText(item.layer, {
      x: 0.7, y: 2.38 + i * 0.76, w: 1.4, h: 0.4,
      fontSize: 11, bold: true, color: item.color, valign: "middle", fontFace: FONT,
    });
    s.addText(item.value, {
      x: 2.1, y: 2.38 + i * 0.76, w: 3.9, h: 0.55,
      fontSize: 10.5, color: C.textSub, valign: "middle", fontFace: FONT, wrap: true,
    });
    if (i < stack.length - 1) {
      s.addShape(pptx.ShapeType.line, {
        x: 0.7, y: 2.92 + i * 0.76, w: 5.4, h: 0,
        line: { color: "1E2A3A", width: 0.5 },
      });
    }
  });

  // Right column — Huawei Cloud
  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.6, y: 1.75, w: 6.2, h: 5.0,
    fill: { color: C.bgCard }, line: { color: C.huawei, width: 1.5 }, rectRadius: 0.14,
  });
  s.addText("Huawei Cloud Services", {
    x: 6.8, y: 1.9, w: 5.8, h: 0.38,
    fontSize: 14, bold: true, color: C.huawei, fontFace: FONT,
  });

  const hwServices = [
    { name: "ECS",           desc: "Elastic Cloud Server hosts the full-stack Next.js app (PM2, Node 18, port 3000)",          color: C.orange, icon: "🖥️" },
    { name: "RDS",           desc: "Managed PostgreSQL database on private subnet 192.168.0.53:5432",                          color: C.teal,   icon: "🐘" },
    { name: "OBS",           desc: "Object Storage for PDF receipts, ID documents, and DB backups (S3-compatible API)",        color: C.sky,    icon: "🪣" },
    { name: "SMN",           desc: "Simple Message Notification — sends email and SMS on credit approval / rejection",         color: C.yellow, icon: "📣" },
    { name: "FunctionGraph", desc: "Serverless cron function runs automated monthly repayment processing (1st of month)",      color: C.purple, icon: "⚡" },
  ];
  hwServices.forEach((svc, i) => {
    s.addText(`${svc.icon}  ${svc.name}`, {
      x: 6.8, y: 2.38 + i * 0.76, w: 1.8, h: 0.55,
      fontSize: 12, bold: true, color: svc.color, valign: "middle", fontFace: FONT,
    });
    s.addText(svc.desc, {
      x: 8.55, y: 2.38 + i * 0.76, w: 4.1, h: 0.55,
      fontSize: 10, color: C.textSub, valign: "middle", fontFace: FONT, wrap: true,
    });
    if (i < hwServices.length - 1) {
      s.addShape(pptx.ShapeType.line, {
        x: 6.8, y: 2.92 + i * 0.76, w: 5.8, h: 0,
        line: { color: "1E2A3A", width: 0.5 },
      });
    }
  });

  logo(s); slideNum(s, 6, TOTAL);
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 7 — ARCHITECTURE DIAGRAM
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  bg(s); topBar(s, C.primary);
  heading(s, "Slide 7", "Architecture Diagram", "Request flow from browser to Huawei Cloud");

  // Helper: draw a node box
  function node(x, y, w, h, label, sublabel, color, active) {
    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w, h,
      fill: { color: C.bgCard },
      line: { color: color, width: active ? 2 : 1 },
      rectRadius: 0.12,
      shadow: active ? { type: "outer", color: color, blur: 8, offset: 0, angle: 45, opacity: 0.5 } : undefined,
    });
    s.addText(label, {
      x: x + 0.12, y: y + (sublabel ? 0.1 : 0.18), w: w - 0.24, h: sublabel ? 0.32 : 0.45,
      fontSize: sublabel ? 12 : 13, bold: true, color: color,
      align: "center", fontFace: FONT,
    });
    if (sublabel) {
      s.addText(sublabel, {
        x: x + 0.12, y: y + 0.42, w: w - 0.24, h: 0.3,
        fontSize: 9, color: C.textMuted, align: "center", fontFace: FONT,
      });
    }
    if (active) {
      s.addShape(pptx.ShapeType.ellipse, {
        x: x + w - 0.22, y: y + 0.08, w: 0.12, h: 0.12,
        fill: { color: C.green }, line: { width: 0 },
      });
    }
  }

  function arrow(x1, y1, x2, y2, label, color) {
    s.addShape(pptx.ShapeType.line, {
      x: x1, y: y1, w: x2 - x1, h: y2 - y1,
      line: { color: color || C.textMuted, width: 1.5, endArrowType: "arrow" },
    });
    if (label) {
      s.addText(label, {
        x: Math.min(x1, x2) + Math.abs(x2 - x1) / 2 - 0.6,
        y: Math.min(y1, y2) - 0.22,
        w: 1.2, h: 0.22,
        fontSize: 8, color: C.textMuted, align: "center", fontFace: FONT,
      });
    }
  }

  // Layout (all centered)
  // Row 1: User
  node(5.4, 1.2, 2.5, 0.72, "User", "Browser / PWA (Mobile)", C.sky, false);
  // arrow down
  arrow(6.65, 1.92, 6.65, 2.4, null, C.sky);
  // Row 2: Nginx + domain
  node(5.0, 2.4, 3.3, 0.72, "Nginx", "e-khadi.co.za · :80/:443", C.orange, false);
  // arrow down
  arrow(6.65, 3.12, 6.65, 3.6, null, C.orange);
  // Row 3: ECS/Next.js
  node(4.5, 3.6, 4.3, 0.72, "Next.js App (ECS)", "110.238.73.51 · PM2 · :3000", C.primary, true);

  // Branches from Next.js (row 4)
  const branches = [
    { x: 0.4,  label: "Prisma ORM",    sub: "→ RDS PostgreSQL\n192.168.0.53:5432", color: C.teal,   dy: 0.3 },
    { x: 3.2,  label: "OBS SDK",       sub: "→ OBS Bucket\nPDF receipts",          color: C.sky,    dy: 0.3 },
    { x: 6.0,  label: "SMN SDK",       sub: "→ SMN Topic\nEmail / SMS alerts",     color: C.yellow, dy: 0.3 },
    { x: 8.8,  label: "FunctionGraph", sub: "→ Monthly repayment\ncron (1st/month)", color: C.purple, dy: 0.3 },
  ];

  // Trunk line
  s.addShape(pptx.ShapeType.line, {
    x: 0.7, y: 5.0, w: 11.9, h: 0,
    line: { color: C.primary, width: 1, dashType: "dash" },
  });

  branches.forEach((b) => {
    // vertical line from trunk
    s.addShape(pptx.ShapeType.line, {
      x: b.x + 1.1, y: 5.0, w: 0, h: 0.5,
      line: { color: b.color, width: 1.5, endArrowType: "arrow" },
    });
    // service box
    node(b.x, 5.5, 2.3, 0.95, b.label, b.sub, b.color, b.label !== "OBS SDK" && b.label !== "FunctionGraph");
  });

  // connecting line from ECS to trunk
  arrow(6.65, 4.32, 6.65, 4.98, null, C.primary);

  logo(s); slideNum(s, 7, TOTAL);
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 8 — CURRENT ARCHITECTURE (5 services, live)
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  bg(s); topBar(s, C.teal);
  heading(s, "Slide 8", "Current Architecture", "5 Huawei Cloud services live in production today");

  // Left: architecture image
  s.addImage({ path: ARCH_CURRENT, x: 0.5, y: 1.75, w: 7.6, h: 4.85 });

  // Right: service list
  s.addShape(pptx.ShapeType.roundRect, {
    x: 8.35, y: 1.75, w: 4.45, h: 4.85,
    fill: { color: C.bgCard }, line: { color: C.teal, width: 1.5 }, rectRadius: 0.14,
  });
  s.addText("Live Services", {
    x: 8.55, y: 1.88, w: 4.1, h: 0.38,
    fontSize: 14, bold: true, color: C.teal, fontFace: FONT,
  });
  s.addShape(pptx.ShapeType.line, { x: 8.55, y: 2.3, w: 4.1, h: 0, line: { color: C.teal, width: 0.7 } });

  const liveServices = [
    { icon: "🖥️", name: "ECS",            desc: "Next.js app · PM2 · Nginx\n110.238.73.51",           color: C.orange },
    { icon: "🐘", name: "RDS PostgreSQL", desc: "Primary DB · private subnet\n192.168.0.53:5432",     color: C.teal },
    { icon: "🪣", name: "OBS",            desc: "PDF receipts · ID docs\nDB backups · CDN origin",    color: C.sky },
    { icon: "📣", name: "SMN",            desc: "SMS & email on credit\napproval / rejection",        color: C.yellow },
    { icon: "⚡", name: "FunctionGraph",  desc: "Monthly repayment cron\nruns on 1st of month",      color: C.purple },
  ];
  liveServices.forEach((svc, i) => {
    const y = 2.4 + i * 0.84;
    s.addText(svc.icon, { x: 8.55, y, w: 0.5, h: 0.7, fontSize: 18, valign: "middle", fontFace: FONT });
    s.addText(svc.name, { x: 9.1, y: y + 0.04, w: 3.6, h: 0.3, fontSize: 12, bold: true, color: svc.color, fontFace: FONT });
    s.addText(svc.desc, { x: 9.1, y: y + 0.34, w: 3.6, h: 0.4, fontSize: 9, color: C.textMuted, fontFace: FONT, wrap: true });
    if (i < liveServices.length - 1) {
      s.addShape(pptx.ShapeType.line, { x: 8.55, y: y + 0.8, w: 4.1, h: 0, line: { color: "1E2A3A", width: 0.5 } });
    }
  });

  logo(s); slideNum(s, 8, TOTAL);
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 9 — FUTURE ARCHITECTURE (38 services)
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  bg(s); topBar(s, C.accent);
  heading(s, "Slide 9", "Future Architecture", "38 Huawei Cloud services across 9 layers at full scale");

  // Full-width architecture image
  s.addImage({ path: ARCH_FUTURE, x: 0.5, y: 1.75, w: 12.3, h: 4.55 });

  // Legend strip
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 6.4, w: 12.3, h: 0.35,
    fill: { color: C.bgCard }, line: { color: C.accent, width: 1 }, rectRadius: 0.08,
  });
  const layers = [
    { label: "Edge", color: "EF4444" },
    { label: "Compute", color: "F97316" },
    { label: "Data", color: "2DD4BF" },
    { label: "Messaging", color: "FBBF24" },
    { label: "AI", color: "A855F7" },
    { label: "Analytics", color: "6366F1" },
    { label: "Observability", color: "22C55E" },
    { label: "Security", color: "EC4899" },
  ];
  layers.forEach((l, i) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.65 + i * 1.5, y: 6.46, w: 0.08, h: 0.22,
      fill: { color: l.color }, line: { width: 0 }, rectRadius: 0.02,
    });
    s.addText(l.label, {
      x: 0.78 + i * 1.5, y: 6.46, w: 1.3, h: 0.22,
      fontSize: 8, color: C.textSub, valign: "middle", fontFace: FONT,
    });
  });
  s.addText("★ = Active today", {
    x: 11.0, y: 6.46, w: 1.7, h: 0.22,
    fontSize: 8, color: C.green, align: "right", valign: "middle", fontFace: FONT,
  });

  logo(s); slideNum(s, 9, TOTAL);
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 10 — HUAWEI CLOUD DASHBOARD (placeholder)
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  bg(s); topBar(s, C.huawei);
  heading(s, "Slide 10", "Huawei Cloud Dashboard", "Active services in the Huawei Cloud console");

  s.addText("Insert Huawei Cloud console screenshots below:", {
    x: 0.5, y: 1.8, w: 12, h: 0.35,
    fontSize: 12, color: C.textMuted, fontFace: FONT,
  });

  const screenshots = [
    { label: "ECS Instance",                     note: "110.238.73.51 — Running",         color: C.orange },
    { label: "RDS PostgreSQL",                    note: "192.168.0.53 — Available",        color: C.teal },
    { label: "OBS Bucket",                        note: "ekhadi-images",                   color: C.sky },
    { label: "SMN Topic",                         note: "ekhadi-notifications",            color: C.yellow },
    { label: "FunctionGraph",                     note: "ekhadi-repayment-processor",      color: C.purple },
  ];

  screenshots.forEach((sc, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.5 + col * 4.3;
    const y = 2.2 + row * 2.4;
    const w = 4.1;
    const h = 2.15;

    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w, h,
      fill: { color: C.bgCard }, line: { color: sc.color, width: 1.5, dashType: "dash" }, rectRadius: 0.14,
    });
    // placeholder icon
    s.addText("📸", { x, y: y + 0.3, w, h: 0.7, fontSize: 30, align: "center", fontFace: FONT });
    s.addText(sc.label, {
      x: x + 0.15, y: y + 1.05, w: w - 0.3, h: 0.42,
      fontSize: 13, bold: true, color: sc.color, align: "center", fontFace: FONT,
    });
    s.addText(sc.note, {
      x: x + 0.15, y: y + 1.5, w: w - 0.3, h: 0.4,
      fontSize: 10, color: C.textMuted, align: "center", fontFace: FONT,
    });
    s.addText("Replace with screenshot", {
      x: x + 0.15, y: y + 1.85, w: w - 0.3, h: 0.25,
      fontSize: 8, color: C.textMuted, align: "center", fontFace: FONT, italic: true,
    });
  });

  logo(s); slideNum(s, 10, TOTAL);
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 11 — FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  bg(s); topBar(s, C.teal);
  heading(s, "Slide 11", "Functions", "Three role-based portals");

  const portals = [
    {
      title: "Member Portal", color: C.primary, icon: "👤", x: 0.5,
      items: [
        "Virtual credit card (glowing dark-mode UI)",
        "Store credit wallet & transaction history",
        "Grant cycle countdown to pay-day",
        "Credit request submission & status",
        "QR payment code (10-min expiry + 8-digit code)",
        "Loyalty points — Bronze → Platinum tiers",
        "2% auto-emergency savings fund",
        "Stokvel group management",
        "Financial advisor chatbot (NLP-powered)",
      ],
    },
    {
      title: "Shop Portal", color: C.teal, icon: "🏪", x: 4.55,
      items: [
        "Transaction management & history",
        "AI stock forecasting (live animated dashboard)",
        "PDF receipt generation (OBS-stored)",
        "Restock order form with category suggestions",
        "Sales heatmap by hour of day",
        "Area-level customer insights",
      ],
    },
    {
      title: "Admin Portal", color: C.orange, icon: "🛡️", x: 8.6,
      items: [
        "Member & group management",
        "Credit approval / rejection workflow",
        "Fraud detection engine (flag + resolve)",
        "Community noticeboard management",
        "ID verification review (OCR + FRS)",
        "Area & shop administration",
      ],
    },
  ];

  portals.forEach((portal) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x: portal.x, y: 1.75, w: 3.9, h: 5.0,
      fill: { color: C.bgCard }, line: { color: portal.color, width: 1.5 }, rectRadius: 0.14,
    });
    s.addText(`${portal.icon}  ${portal.title}`, {
      x: portal.x + 0.2, y: 1.9, w: 3.5, h: 0.5,
      fontSize: 14, bold: true, color: portal.color, fontFace: FONT,
    });
    s.addShape(pptx.ShapeType.line, {
      x: portal.x + 0.2, y: 2.43, w: 3.5, h: 0,
      line: { color: portal.color, width: 0.7 },
    });
    portal.items.forEach((item, i) => {
      s.addText(`›  ${item}`, {
        x: portal.x + 0.2, y: 2.52 + i * 0.46, w: 3.5, h: 0.42,
        fontSize: 10, color: C.textSub, fontFace: FONT, wrap: true,
      });
    });
  });

  logo(s); slideNum(s, 11, TOTAL);
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 12 — INNOVATIONS
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  bg(s); topBar(s, C.purple);
  heading(s, "Slide 12", "Innovations", "What makes e-Khadi stand out");

  const innovations = [
    { icon: "🧠", name: "AI Stock Forecast",      color: C.purple, desc: "Analyses 30-day purchase patterns per area — shows CRITICAL / LOW / STOCKED status with restock suggestions powered by Huawei ModelArts." },
    { icon: "🛡️", name: "Auto Emergency Fund",    color: C.green,  desc: "2% of every store credit purchase is automatically saved into a locked emergency pot, building savings invisibly with every transaction." },
    { icon: "🚨", name: "Fraud Detection Engine", color: C.red,    desc: "Flags rapid purchases (5+ in 1 hour) and high velocity (R300+ in 24h) in real time using SQL aggregation — resolve alerts from the admin panel." },
    { icon: "📱", name: "QR Code Payments",       color: C.sky,    desc: "Member displays an animated QR code or 8-digit short code with a 10-minute timer — shop scans to debit. No cash, no physical card needed." },
    { icon: "⭐", name: "Loyalty Rewards",        color: C.yellow, desc: "1 point per R10 spent, four tiers (Bronze → Silver → Gold → Platinum), redeem 100 points = R10 credit. Animated progress bar on member card." },
    { icon: "🛒", name: "Community Bulk Buy",     color: C.orange, desc: "Group members pool pledges to buy wholesale together. Coordinator tracks progress — auto-promotes to FUNDED when target quantity is reached." },
    { icon: "💬", name: "Financial Chatbot",      color: C.teal,   desc: "Floating AI assistant with quick-prompt buttons: save, budget, debt, food, electricity. Personalised tips in plain language." },
  ];

  innovations.forEach((inv, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    // Last item centred
    const isLast = i === innovations.length - 1;
    const x = isLast ? 3.4 : 0.5 + col * 6.4;
    const y = 1.82 + row * 1.38;

    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w: isLast ? 6.5 : 6.1, h: 1.2,
      fill: { color: C.bgCard }, line: { color: inv.color, width: 1 }, rectRadius: 0.12,
    });
    s.addText(`${inv.icon}`, {
      x: x + 0.15, y, w: 0.55, h: 1.2,
      fontSize: 22, align: "center", valign: "middle", fontFace: FONT,
    });
    s.addText(inv.name, {
      x: x + 0.75, y: y + 0.12, w: (isLast ? 6.5 : 6.1) - 0.9, h: 0.38,
      fontSize: 13, bold: true, color: inv.color, fontFace: FONT,
    });
    s.addText(inv.desc, {
      x: x + 0.75, y: y + 0.52, w: (isLast ? 6.5 : 6.1) - 0.9, h: 0.6,
      fontSize: 9.5, color: C.textSub, fontFace: FONT, wrap: true,
    });
  });

  logo(s); slideNum(s, 12, TOTAL);
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 13 — BUSINESS VALUE
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  bg(s); topBar(s, C.green);
  heading(s, "Slide 13", "Business Value", "Social impact, market opportunity, and sustainability");

  const cards = [
    {
      icon: "🌍", title: "Social Impact", color: C.green, x: 0.5, y: 1.75,
      points: [
        "Financially includes 18M+ South Africans currently excluded from formal banking",
        "Reduces credit defaults by digitising repayment commitments",
        "Builds savings culture through automated 2% emergency fund",
        "Digitises and formalises stokvels — transparent, auditable, automated",
      ],
    },
    {
      icon: "🏪", title: "For Shop Owners", color: C.teal, x: 6.7, y: 1.75,
      points: [
        "Reduces default risk — credit tied to SASSA grant cycle",
        "AI-driven stock management increases revenue per customer",
        "Digital receipts reduce paper disputes",
        "Community bulk buying boosts volume",
      ],
    },
    {
      icon: "📈", title: "Market Size", color: C.yellow, x: 0.5, y: 4.35,
      points: [
        "R70 billion+ SASSA grant disbursements annually in South Africa",
        "~80,000 spaza shops in South Africa (informal market)",
        "Township economy estimated at R100bn+ per annum",
      ],
    },
    {
      icon: "💼", title: "Business Model", color: C.primary, x: 6.7, y: 4.35,
      points: [
        "Platform fee as a % of credit issued per month",
        "Premium analytics dashboard subscription for shop owners",
        "White-label licensing to NGOs and municipalities",
        "Data insights product for FMCG brands entering township markets",
      ],
    },
  ];

  cards.forEach((c) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x: c.x, y: c.y, w: 6.0, h: 2.4,
      fill: { color: C.bgCard }, line: { color: c.color, width: 1 }, rectRadius: 0.14,
    });
    s.addText(`${c.icon}  ${c.title}`, {
      x: c.x + 0.2, y: c.y + 0.14, w: 5.6, h: 0.4,
      fontSize: 14, bold: true, color: c.color, fontFace: FONT,
    });
    c.points.forEach((pt, i) => {
      s.addText(`›  ${pt}`, {
        x: c.x + 0.2, y: c.y + 0.62 + i * 0.44, w: 5.6, h: 0.4,
        fontSize: 10.5, color: C.textSub, fontFace: FONT, wrap: true,
      });
    });
  });

  logo(s); slideNum(s, 13, TOTAL);
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 14 — VERIFICATION
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  bg(s); topBar(s, C.sky);
  heading(s, "Slide 14", "Verification", "How to access and test e-Khadi");

  // Live deployment card
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 1.75, w: 12.3, h: 1.2,
    fill: { color: C.bgCard },
    line: { color: C.green, width: 2 },
    rectRadius: 0.14,
    shadow: { type: "outer", color: C.green, blur: 10, offset: 0, angle: 45, opacity: 0.4 },
  });
  s.addShape(pptx.ShapeType.ellipse, {
    x: 0.72, y: 2.12, w: 0.14, h: 0.14,
    fill: { color: C.green }, line: { width: 0 },
  });
  s.addText("LIVE", {
    x: 0.92, y: 2.05, w: 0.7, h: 0.28,
    fontSize: 10, bold: true, color: C.green, fontFace: FONT,
  });
  s.addText("https://e-khadi.co.za", {
    x: 1.7, y: 2.0, w: 7, h: 0.42,
    fontSize: 20, bold: true, color: C.white, fontFace: FONT,
  });
  s.addText("Huawei ECS · af-south-1 · 110.238.73.51", {
    x: 1.7, y: 2.44, w: 8, h: 0.3,
    fontSize: 11, color: C.textMuted, fontFace: FONT,
  });

  // Test accounts
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 3.15, w: 12.3, h: 1.5,
    fill: { color: C.bgCard }, line: { color: C.primary, width: 1 }, rectRadius: 0.14,
  });
  s.addText("Judge Test Accounts", {
    x: 0.7, y: 3.28, w: 5, h: 0.36,
    fontSize: 13, bold: true, color: C.primary, fontFace: FONT,
  });
  const accounts = [
    { role: "ADMIN",  email: "admin@ekhadi.co.za",  pass: "Admin@2026!" },
    { role: "MEMBER", email: "member@ekhadi.co.za", pass: "Member@2026!" },
    { role: "SHOP",   email: "shop@ekhadi.co.za",   pass: "Shop@2026!" },
  ];
  accounts.forEach((acc, i) => {
    const x = 0.7 + i * 4.1;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 3.7, w: 3.8, h: 0.8,
      fill: { color: "1A2235" }, line: { color: C.primary, width: 0.8 }, rectRadius: 0.08,
    });
    s.addText(acc.role, {
      x: x + 0.15, y: 3.74, w: 1.0, h: 0.3,
      fontSize: 10, bold: true, color: C.primary, fontFace: FONT,
    });
    s.addText(acc.email, {
      x: x + 0.15, y: 4.06, w: 3.5, h: 0.25,
      fontSize: 9, color: C.sky, fontFace: FONT,
    });
    s.addText(`pw: ${acc.pass}`, {
      x: x + 1.2, y: 3.74, w: 2.4, h: 0.28,
      fontSize: 9, color: C.textMuted, fontFace: FONT,
    });
  });

  // Test scope
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 4.85, w: 5.9, h: 1.85,
    fill: { color: C.bgCard }, line: { color: C.teal, width: 1 }, rectRadius: 0.14,
  });
  s.addText("Beta Test Scope", {
    x: 0.7, y: 4.98, w: 5.5, h: 0.36,
    fontSize: 13, bold: true, color: C.teal, fontFace: FONT,
  });
  ["Full role-based testing — admin, member, and shop owner flows", "Credit request → approval → repayment full cycle", "QR code generation and redemption end-to-end"].forEach((pt, i) => {
    s.addText(`›  ${pt}`, { x: 0.7, y: 5.4 + i * 0.42, w: 5.5, h: 0.38, fontSize: 10.5, color: C.textSub, fontFace: FONT, wrap: true });
  });

  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.6, y: 4.85, w: 6.2, h: 1.85,
    fill: { color: C.bgCard }, line: { color: C.yellow, width: 1 }, rectRadius: 0.14,
  });
  s.addText("Test Data", {
    x: 6.8, y: 4.98, w: 5.8, h: 0.36,
    fontSize: 13, bold: true, color: C.yellow, fontFace: FONT,
  });
  ["Seeded with realistic SA community data (areas, groups, transactions)", "3 areas: Soweto, Khayelitsha, Umlazi", "Multiple stokvel groups with realistic credit histories"].forEach((pt, i) => {
    s.addText(`›  ${pt}`, { x: 6.8, y: 5.4 + i * 0.42, w: 5.8, h: 0.38, fontSize: 10.5, color: C.textSub, fontFace: FONT, wrap: true });
  });

  logo(s); slideNum(s, 14, TOTAL);
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 15 — DEMO & FOLLOW-UP PLAN
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  bg(s); topBar(s, C.orange);
  heading(s, "Slide 15", "Demo & Follow-up Plan", "Live demo and roadmap to scale");

  // Demo link
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 1.72, w: 12.3, h: 0.85,
    fill: { color: C.bgCard }, line: { color: C.orange, width: 1.5 }, rectRadius: 0.12,
  });
  s.addText("🌐  Demo:", { x: 0.7, y: 1.82, w: 1.6, h: 0.5, fontSize: 13, bold: true, color: C.orange, valign: "middle", fontFace: FONT });
  s.addText("https://e-khadi.co.za", { x: 2.35, y: 1.82, w: 7, h: 0.5, fontSize: 18, bold: true, color: C.white, valign: "middle", fontFace: FONT });
  s.addText("Use judge credentials from Slide 12 to explore all three portals", { x: 9.4, y: 1.9, w: 3.2, h: 0.45, fontSize: 9, color: C.textMuted, fontFace: FONT, wrap: true });

  // Roadmap table
  s.addText("Roadmap", {
    x: 0.5, y: 2.72, w: 5, h: 0.4,
    fontSize: 14, bold: true, color: C.orange, fontFace: FONT,
  });

  const roadmap = [
    { phase: "Phase 1 ✅", time: "Now",       goal: "Full web app live on Huawei Cloud — ECS, RDS, OBS, SMN, FunctionGraph", color: C.green },
    { phase: "Phase 2",    time: "3 months",  goal: "WhatsApp notifications (Huawei MSGSMS), USSD fallback for feature phones", color: C.sky },
    { phase: "Phase 3",    time: "6 months",  goal: "Native Android app (Huawei AppGallery), biometric login via FRS", color: C.primary },
    { phase: "Phase 4",    time: "12 months", goal: "National rollout — 10,000 members across 5 provinces", color: C.yellow },
    { phase: "Phase 5",    time: "2 years",   goal: "Expand to Zimbabwe, Zambia, Nigeria — pan-African stokvel platform", color: C.orange },
  ];

  const tY = 3.18;
  const rowH = 0.65;
  // Header
  s.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: tY, w: 12.3, h: 0.42,
    fill: { color: "1E2A3A" }, line: { width: 0 },
  });
  ["Phase", "Timeline", "Goal"].forEach((h, i) => {
    s.addText(h, {
      x: 0.7 + [0, 2.0, 4.0][i], y: tY, w: [1.8, 1.8, 8.0][i], h: 0.42,
      fontSize: 11, bold: true, color: C.orange, valign: "middle", fontFace: FONT,
    });
  });

  roadmap.forEach((row, i) => {
    if (i % 2 === 0) {
      s.addShape(pptx.ShapeType.rect, {
        x: 0.5, y: tY + 0.42 + i * rowH, w: 12.3, h: rowH,
        fill: { color: "161D2E" }, line: { width: 0 },
      });
    }
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.58, y: tY + 0.5 + i * rowH, w: 1.6, h: 0.38,
      fill: { color: "1A2235" }, line: { color: row.color, width: 0.8 }, rectRadius: 0.06,
    });
    s.addText(row.phase, {
      x: 0.58, y: tY + 0.5 + i * rowH, w: 1.6, h: 0.38,
      fontSize: 9, bold: true, color: row.color, align: "center", valign: "middle", fontFace: FONT,
    });
    s.addText(row.time, {
      x: 2.7, y: tY + 0.48 + i * rowH, w: 1.5, h: 0.42,
      fontSize: 11, color: C.textSub, valign: "middle", fontFace: FONT,
    });
    s.addText(row.goal, {
      x: 4.4, y: tY + 0.46 + i * rowH, w: 8.2, h: 0.5,
      fontSize: 10.5, color: C.text, valign: "middle", fontFace: FONT, wrap: true,
    });
    // divider
    s.addShape(pptx.ShapeType.line, {
      x: 0.5, y: tY + 0.42 + (i + 1) * rowH, w: 12.3, h: 0,
      line: { color: "1E2A3A", width: 0.5 },
    });
  });

  logo(s); slideNum(s, 15, TOTAL);
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 16 — ACHIEVEMENTS
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  bg(s); topBar(s, C.green);
  heading(s, "Slide 16", "Achievements", "What we have built and delivered");

  const achievements = [
    { icon: "✅", title: "Live on Huawei Cloud",          desc: "ECS + RDS + OBS + SMN + FunctionGraph — all 5 services integrated and running in production at 110.238.73.51", color: C.green },
    { icon: "✅", title: "50+ API Routes",                desc: "19 pages · 3-role auth system (ADMIN / MEMBER / SHOP) · Full CRUD on every resource", color: C.teal },
    { icon: "✅", title: "PWA — Installable App",         desc: "Service worker + manifest.json — installable on Android and iOS home screen with offline capability", color: C.sky },
    { icon: "✅", title: "Custom Domain",                 desc: "e-khadi.co.za pointing to Huawei ECS · Nginx configured · SSL via Certbot / Let's Encrypt", color: C.primary },
    { icon: "✅", title: "15 Innovative Features",        desc: "QR payments, loyalty system, emergency fund, fraud engine, bulk buy, AI forecast, chatbot and more", color: C.purple },
    { icon: "✅", title: "Production Database",           desc: "PostgreSQL on Huawei RDS with 15+ tables, realistic seed data, full Prisma ORM schema", color: C.yellow },
  ];

  achievements.forEach((a, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.5 + col * 6.4;
    const y = 1.78 + row * 1.68;

    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 6.1, h: 1.5,
      fill: { color: C.bgCard }, line: { color: a.color, width: 1.5 }, rectRadius: 0.14,
      shadow: { type: "outer", color: a.color, blur: 6, offset: 0, angle: 45, opacity: 0.2 },
    });
    s.addText(a.icon, {
      x: x + 0.18, y, w: 0.6, h: 1.5,
      fontSize: 22, align: "center", valign: "middle", fontFace: FONT,
    });
    s.addText(a.title, {
      x: x + 0.82, y: y + 0.2, w: 5.1, h: 0.4,
      fontSize: 14, bold: true, color: a.color, fontFace: FONT,
    });
    s.addText(a.desc, {
      x: x + 0.82, y: y + 0.62, w: 5.1, h: 0.72,
      fontSize: 10.5, color: C.textSub, fontFace: FONT, wrap: true,
    });
  });

  // Final CTA
  s.addShape(pptx.ShapeType.roundRect, {
    x: 1.5, y: 6.68, w: 9.8, h: 0.52,
    fill: { color: "0D2318" }, line: { color: C.green, width: 1 }, rectRadius: 0.1,
  });
  s.addText("🌍  e-Khadi is live, functional, and ready to serve South Africa's township communities — https://e-khadi.co.za", {
    x: 1.5, y: 6.68, w: 9.8, h: 0.52,
    fontSize: 10.5, bold: true, color: C.green, align: "center", valign: "middle", fontFace: FONT,
  });

  logo(s); slideNum(s, 16, TOTAL);
}

// ─── Write file ──────────────────────────────────────────────────────────────
pptx.writeFile({ fileName: path.join(OUT_DIR, "ekhadi-competition.pptx") })
  .then(() => console.log("✅  Saved: out/ekhadi-competition.pptx"))
  .catch((e) => { console.error(e); process.exit(1); });