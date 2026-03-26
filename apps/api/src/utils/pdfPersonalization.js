import fs from "node:fs/promises";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import { ApiError } from "./ApiError.js";

function normalizeBuyerName(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 80);
}

function normalizePdfTitle(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 120);
}

function buildWatermarkText(buyerName, title) {
  const normalizedTitle = normalizePdfTitle(title);
  return normalizedTitle ? `${buyerName} | ${normalizedTitle}` : buyerName;
}

function fitTextSize(font, text, maxWidth, preferredSize, minimumSize) {
  let size = preferredSize;

  while (size > minimumSize && font.widthOfTextAtSize(text, size) > maxWidth) {
    size -= 0.5;
  }

  return Math.max(size, minimumSize);
}

function drawInfoChip(page, { x, y, width, height, label, value, labelFont, valueFont, accentColor }) {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: rgb(0.93, 0.96, 1),
    borderColor: rgb(0.76, 0.84, 0.97),
    borderWidth: 1,
    opacity: 0.52,
  });

  const labelSize = fitTextSize(labelFont, label, width - 18, 8.5, 6.5);
  const valueSize = fitTextSize(valueFont, value, width - 18, 12, 8.5);

  page.drawText(label, {
    x: x + 9,
    y: y + height - 14,
    size: labelSize,
    font: labelFont,
    color: accentColor,
    opacity: 0.72,
  });

  page.drawText(value, {
    x: x + 9,
    y: y + 9,
    size: valueSize,
    font: valueFont,
    color: accentColor,
    opacity: 0.88,
  });
}

export async function personalizePdfDownload(absolutePath, { buyerName, title = "" } = {}) {
  const normalizedBuyerName = normalizeBuyerName(buyerName);

  if (!normalizedBuyerName) {
    throw new ApiError(400, "Buyer name is required to prepare this PDF download.");
  }

  let sourceBytes;

  try {
    sourceBytes = await fs.readFile(absolutePath);
  } catch {
    throw new ApiError(404, "The PDF file is not available on the server.");
  }

  let pdfDocument;

  try {
    pdfDocument = await PDFDocument.load(sourceBytes, {
      updateMetadata: false,
      ignoreEncryption: true,
    });
  } catch {
    throw new ApiError(500, "Unable to prepare a personalized PDF for this purchase.");
  }

  const accentColor = rgb(0.11, 0.24, 0.47);
  const boldFont = await pdfDocument.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDocument.embedFont(StandardFonts.Helvetica);
  const watermarkText = buildWatermarkText(normalizedBuyerName, title);
  const licenseText = `Licensed to ${normalizedBuyerName}`;
  const footerText = `Downloaded for ${normalizedBuyerName} via ExamNova AI`;

  for (const page of pdfDocument.getPages()) {
    const { width, height } = page.getSize();
    const margin = Math.max(18, Math.min(28, width * 0.04));
    const diagonalSize = Math.max(22, Math.min(44, width * 0.055));
    const secondaryDiagonalSize = Math.max(16, Math.min(30, width * 0.038));
    const sideSize = Math.max(8, Math.min(11, width * 0.013));
    const footerSize = Math.max(8, Math.min(10.5, width * 0.013));
    const diagonalTextWidth = boldFont.widthOfTextAtSize(watermarkText, diagonalSize);
    const secondaryTextWidth = regularFont.widthOfTextAtSize(normalizedBuyerName, secondaryDiagonalSize);
    const centerX = Math.max(margin, (width - diagonalTextWidth) / 2);
    const centerY = Math.max(36, height * 0.42);
    const footerTextWidth = regularFont.widthOfTextAtSize(footerText, footerSize);
    const leftSideY = Math.max(78, height * 0.32);
    const rightSideY = Math.max(120, height * 0.64);
    const chipWidth = Math.min(220, width - margin * 2);
    const chipHeight = 40;

    drawInfoChip(page, {
      x: margin,
      y: Math.max(margin, height - margin - chipHeight),
      width: chipWidth,
      height: chipHeight,
      label: "LICENSED TO",
      value: normalizedBuyerName,
      labelFont: regularFont,
      valueFont: boldFont,
      accentColor,
    });

    if (width >= 360) {
      const rightChipText = "PERSONALIZED PDF";
      const rightChipWidth = Math.min(176, width * 0.3);

      drawInfoChip(page, {
        x: Math.max(margin, width - margin - rightChipWidth),
        y: Math.max(margin, height - margin - chipHeight),
        width: rightChipWidth,
        height: chipHeight,
        label: "DELIVERY",
        value: rightChipText,
        labelFont: regularFont,
        valueFont: boldFont,
        accentColor,
      });
    }

    page.drawText(watermarkText, {
      x: centerX,
      y: centerY,
      size: diagonalSize,
      font: boldFont,
      color: accentColor,
      opacity: 0.12,
      rotate: degrees(32),
    });

    page.drawText(normalizedBuyerName, {
      x: Math.max(margin, (width - secondaryTextWidth) / 2),
      y: Math.max(36, height * 0.18),
      size: secondaryDiagonalSize,
      font: regularFont,
      color: accentColor,
      opacity: 0.08,
      rotate: degrees(-28),
    });

    page.drawText(licenseText, {
      x: margin - 4,
      y: leftSideY,
      size: sideSize,
      font: regularFont,
      color: accentColor,
      opacity: 0.26,
      rotate: degrees(90),
    });

    page.drawText(normalizedBuyerName, {
      x: width - margin - 4,
      y: rightSideY,
      size: sideSize,
      font: boldFont,
      color: accentColor,
      opacity: 0.24,
      rotate: degrees(-90),
    });

    page.drawText(footerText, {
      x: Math.max(margin, (width - footerTextWidth) / 2),
      y: 14,
      size: footerSize,
      font: regularFont,
      color: accentColor,
      opacity: 0.28,
    });
  }

  const personalizedBytes = await pdfDocument.save();
  return Buffer.from(personalizedBytes);
}
