// Draws the "Meet Joseph" lanyard artwork (card front, card back, strap) on a
// canvas at runtime and returns data URLs for the Lanyard component. Drawing it
// here keeps the badge text crisp, on-brand and editable without image files.

const W = 1024;
const H = 1440; // matches the portrait card's 1.6 × 2.25 proportions
const ORANGE = "#ff6a00";
const INK = "#111111";
const PAPER = "#f6f3ef";
const DISPLAY = "'Space Grotesk', system-ui, sans-serif";
const SANS = "Inter, system-ui, sans-serif";
const SERIF = "'Instrument Serif', Georgia, serif";

export interface BadgeArt {
  front: string;
  back: string;
  strap: string;
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement | null>(resolve => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

const canvas = (width: number, height: number) => {
  const el = document.createElement("canvas");
  el.width = width;
  el.height = height;
  const ctx = el.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");
  return { el, ctx };
};

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

const spaced = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) => {
  // Canvas letterSpacing is not in every browser yet, so space letters by hand.
  const chars = [...text];
  const total = chars.reduce((sum, c) => sum + ctx.measureText(c).width, 0) + spacing * (chars.length - 1);
  let cursor = ctx.textAlign === "center" ? x - total / 2 : x;
  const align = ctx.textAlign;
  ctx.textAlign = "left";
  for (const c of chars) {
    ctx.fillText(c, cursor, y);
    cursor += ctx.measureText(c).width + spacing;
  }
  ctx.textAlign = align;
};

const drawFront = (portrait: HTMLImageElement | null) => {
  const { el, ctx } = canvas(W, H);
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W * 0.85, H * 0.1, 0, W * 0.85, H * 0.1, W);
  glow.addColorStop(0, "rgba(255,106,0,0.35)");
  glow.addColorStop(1, "rgba(255,106,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Top label sits under the lanyard slot.
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = `600 30px ${SANS}`;
  spaced(ctx, "JM MARKETING", W / 2, 205, 6);

  // Portrait
  const size = 500;
  const px = (W - size) / 2;
  const py = 260;
  ctx.save();
  roundRect(ctx, px, py, size, size, 56);
  ctx.clip();
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(px, py, size, size);
  if (portrait) {
    const scale = Math.max(size / portrait.width, size / portrait.height);
    const w = portrait.width * scale;
    const h = portrait.height * scale;
    ctx.drawImage(portrait, px + (size - w) / 2, py + (size - h) / 2, w, h);
  }
  ctx.restore();
  ctx.strokeStyle = ORANGE;
  ctx.lineWidth = 8;
  roundRect(ctx, px - 14, py - 14, size + 28, size + 28, 66);
  ctx.stroke();

  // Name and role
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 92px ${DISPLAY}`;
  ctx.fillText("Joseph", W / 2, 900);
  ctx.fillStyle = ORANGE;
  ctx.font = `italic 400 104px ${SERIF}`;
  ctx.fillText("Maina", W / 2, 1000);

  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.font = `500 38px ${SANS}`;
  ctx.fillText("Digital Marketing Manager", W / 2, 1080);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = `400 32px ${SANS}`;
  ctx.fillText("Paid ads · SEO · Content", W / 2, 1134);

  // Bottom access strip
  ctx.fillStyle = ORANGE;
  ctx.fillRect(0, H - 190, W, 190);
  ctx.fillStyle = INK;
  ctx.font = `700 40px ${DISPLAY}`;
  ctx.textAlign = "left";
  spaced(ctx, "ALL ACCESS", 72, H - 105, 4);
  ctx.font = `500 30px ${SANS}`;
  ctx.fillText("Nairobi, Kenya", 72, H - 58);
  ctx.textAlign = "right";
  ctx.font = `700 66px ${DISPLAY}`;
  ctx.fillText("JM", W - 72, H - 70);

  return el.toDataURL("image/png");
};

const drawBack = () => {
  const { el, ctx } = canvas(W, H);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "left";
  ctx.fillStyle = ORANGE;
  ctx.font = `600 30px ${SANS}`;
  spaced(ctx, "WHAT I DO", 90, 260, 6);

  ctx.fillStyle = INK;
  ctx.font = `700 84px ${DISPLAY}`;
  ctx.fillText("More customers,", 90, 370);
  ctx.font = `italic 400 96px ${SERIF}`;
  ctx.fillStyle = ORANGE;
  ctx.fillText("tracked properly.", 90, 470);

  const services = ["Meta & TikTok Ads", "Google Ads", "SEO", "Social media management", "Media buying"];
  ctx.font = `500 44px ${SANS}`;
  services.forEach((service, i) => {
    const y = 620 + i * 96;
    ctx.fillStyle = ORANGE;
    ctx.beginPath();
    ctx.arc(108, y - 15, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.fillText(service, 148, y);
  });

  ctx.strokeStyle = "rgba(17,17,17,0.15)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(90, 1145);
  ctx.lineTo(W - 90, 1145);
  ctx.stroke();

  ctx.fillStyle = INK;
  ctx.font = `700 46px ${DISPLAY}`;
  ctx.fillText("Book a free audit", 90, 1235);
  ctx.fillStyle = "rgba(17,17,17,0.6)";
  ctx.font = `400 34px ${SANS}`;
  ctx.fillText("josephmaina.co.ke", 90, 1295);

  return el.toDataURL("image/png");
};

const drawStrap = () => {
  // The Lanyard rotates this image so its width runs along the strap.
  const { el, ctx } = canvas(1400, 192);
  ctx.fillStyle = ORANGE;
  ctx.fillRect(0, 0, el.width, el.height);
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(0, 14, el.width, 4);
  ctx.fillRect(0, el.height - 18, el.width, 4);
  ctx.fillStyle = INK;
  ctx.font = `700 64px ${DISPLAY}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  spaced(ctx, "JOSEPH MAINA  •  MARKETING", el.width / 2, el.height / 2 + 4, 6);
  return el.toDataURL("image/png");
};

export async function createBadgeArt(portraitSrc: string): Promise<BadgeArt> {
  // Wait for web fonts so the canvas text uses the site's typefaces.
  await Promise.race([document.fonts?.ready, new Promise(r => setTimeout(r, 1500))]);
  const portrait = await loadImage(portraitSrc);
  return { front: drawFront(portrait), back: drawBack(), strap: drawStrap() };
}
