function drawFlowFigure(doc, x, y, width, height) {
  const topWidth = Math.min(74, width - 24);
  const bottomWidth = Math.min(74, width - 24);

  doc.roundedRect(x + 8, y, topWidth, 14, 3).stroke();
  doc.roundedRect(x + 8, y + height - 18, bottomWidth, 14, 3).stroke();
  doc.moveTo(x + 44, y + 14).lineTo(x + 44, y + height - 18).stroke();
  doc
    .moveTo(x + 40, y + height - 22)
    .lineTo(x + 44, y + height - 18)
    .lineTo(x + 48, y + height - 22)
    .stroke();
}

function drawBlockFigure(doc, x, y, width) {
  const blockWidth = Math.min(32, width / 3 - 8);
  [0, 1, 2].forEach((index) => {
    const offsetX = x + index * (blockWidth + 8);
    doc.rect(offsetX, y + 8, blockWidth, 18).stroke();
    if (index < 2) {
      doc.moveTo(offsetX + blockWidth, y + 17).lineTo(offsetX + blockWidth + 8, y + 17).stroke();
    }
  });
}

export const pdfFigureRendererService = {
  render(doc, block, layout) {
    const height = block.figureHeight || 36;
    const width = Math.min(120, layout.contentWidth);
    const startX = layout.marginLeft + 4;
    const startY = doc.y + 2;

    doc.save();
    doc.lineWidth(0.5);
    doc.roundedRect(startX - 4, startY - 2, width + 8, height, 4).stroke("#9a5b00");

    if ((block.figureType || "").includes("flow")) {
      drawFlowFigure(doc, startX, startY + 6, width, height - 12);
    } else if ((block.figureType || "").includes("block")) {
      drawBlockFigure(doc, startX + 6, startY + 4, width - 12);
    } else {
      doc.circle(startX + 18, startY + 18, 9).stroke();
      doc.moveTo(startX + 28, startY + 18).lineTo(startX + width - 16, startY + 18).stroke();
      doc.moveTo(startX + width / 2, startY + 8).lineTo(startX + width / 2, startY + height - 10).stroke();
    }

    doc
      .font("Helvetica")
      .fontSize(5)
      .fillColor("#9a5b00")
      .text(block.figureInstructions || "Mini-figure", startX + width + 10, startY + 2, {
        width: Math.max(layout.contentWidth - width - 18, 60),
        align: "left",
      });
    doc.restore();
    doc.moveDown(0.4);
    doc.y = Math.max(doc.y, startY + height + 2);
  },
};
