import PDFDocument from "pdfkit";
import { pdfFigureRendererService } from "./pdfFigureRenderer.service.js";

const PAGE_SIZE = "A4";
const PAGE_MARGIN = 26;

function createLayout(doc) {
  return {
    pageWidth: doc.page.width,
    pageHeight: doc.page.height,
    marginLeft: PAGE_MARGIN,
    marginRight: PAGE_MARGIN,
    marginTop: PAGE_MARGIN,
    marginBottom: PAGE_MARGIN,
    contentWidth: doc.page.width - PAGE_MARGIN * 2,
    contentBottom: doc.page.height - PAGE_MARGIN,
  };
}

function ensureSpace(doc, layout, requiredHeight) {
  if (doc.y + requiredHeight <= layout.contentBottom) {
    return layout;
  }

  doc.addPage();
  const nextLayout = createLayout(doc);
  doc.y = nextLayout.marginTop;
  return nextLayout;
}

function writeHeader(doc, preparedContent, layout) {
  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor("#10212b")
    .text(preparedContent.title, layout.marginLeft, layout.marginTop, {
      width: layout.contentWidth,
      align: "left",
    });

  doc
    .font("Helvetica")
    .fontSize(5)
    .fillColor("#5d6b75")
    .text(
      `${preparedContent.stats.totalQuestions} questions | ${preparedContent.stats.figureCount} mini-figures planned`,
      layout.marginLeft,
      doc.y + 1,
      {
        width: layout.contentWidth,
      },
    );

  doc.moveDown(0.35);
  doc.strokeColor("#d7c4b3").moveTo(layout.marginLeft, doc.y).lineTo(layout.pageWidth - layout.marginRight, doc.y).stroke();
  doc.moveDown(0.55);
}

function renderAnswerParagraphs(doc, block, layout) {
  block.answerParagraphs.forEach((paragraph) => {
    const estimatedHeight = doc.heightOfString(paragraph, {
      width: layout.contentWidth,
      align: "justify",
      lineGap: 0.4,
    });
    layout = ensureSpace(doc, layout, estimatedHeight + 8);
    doc
      .font("Helvetica")
      .fontSize(6)
      .fillColor("#10212b")
      .text(paragraph, layout.marginLeft, doc.y, {
        width: layout.contentWidth,
        align: "justify",
        lineGap: 0.4,
      });
    doc.moveDown(0.22);
  });

  return layout;
}

function renderQuestionBlock(doc, block, layout) {
  const questionHeight = doc.heightOfString(block.questionLine, {
    width: layout.contentWidth,
    lineGap: 0.5,
  });
  const answerPreview = block.answerParagraphs.join("\n\n").slice(0, 500);
  const answerHeight = doc.heightOfString(answerPreview || " ", {
    width: layout.contentWidth,
    lineGap: 0.4,
  });
  const estimatedHeight = questionHeight + answerHeight + block.figureHeight + 18;

  layout = ensureSpace(doc, layout, estimatedHeight);

  doc
    .font("Helvetica-Bold")
    .fontSize(6)
    .fillColor("#10212b")
    .text(block.questionLine, layout.marginLeft, doc.y, {
      width: layout.contentWidth,
      align: "left",
      lineGap: 0.5,
    });
  doc.moveDown(0.18);

  layout = renderAnswerParagraphs(doc, block, layout);

  if (block.figureRequired) {
    layout = ensureSpace(doc, layout, block.figureHeight + 8);
    pdfFigureRendererService.render(doc, block, layout);
  }

  doc.moveDown(0.12);
  doc.strokeColor("#efe4d7").moveTo(layout.marginLeft, doc.y).lineTo(layout.pageWidth - layout.marginRight, doc.y).stroke();
  doc.moveDown(0.35);

  return layout;
}

export const pdfRendererService = {
  async render(preparedContent) {
    const doc = new PDFDocument({
      size: PAGE_SIZE,
      margins: {
        top: PAGE_MARGIN,
        bottom: PAGE_MARGIN,
        left: PAGE_MARGIN,
        right: PAGE_MARGIN,
      },
      autoFirstPage: true,
      compress: true,
      info: {
        Title: preparedContent.title,
        Author: "ExamNova AI",
        Subject: "Compact exam preparation notes",
        Keywords: "exam prep, revision, compact answers",
      },
    });

    const chunks = [];
    let pageCount = 1;
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("pageAdded", () => {
      pageCount += 1;
    });

    let layout = createLayout(doc);
    doc.y = layout.marginTop;
    writeHeader(doc, preparedContent, layout);

    preparedContent.blocks.forEach((block) => {
      layout = renderQuestionBlock(doc, block, layout);
    });

    doc.end();

    const buffer = await new Promise((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    });

    return {
      buffer,
      pageCount,
    };
  },
};
