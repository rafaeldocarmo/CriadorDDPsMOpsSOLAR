import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ImageModule from "docxtemplater-image";

async function loadTemplateArrayBuffer(templatePath) {
  const response = await fetch(templatePath);
  if (!response.ok) {
    throw new Error(`Falha ao carregar template: ${templatePath}`);
  }
  return response.arrayBuffer();
}

function normalizeData(values) {
  return Object.entries(values).reduce((acc, [key, value]) => {
    if (key === "analise" && Array.isArray(value)) {
      acc[key] = buildAnalysisBlocks(value);
      return acc;
    }
    if (key === "passoapasso" && Array.isArray(value)) {
      acc[key] = buildPassoAPassoBlocks(value);
      return acc;
    }

    acc[key] = value == null ? "" : String(value);
    return acc;
  }, {});
}

function buildAnalysisBlocks(blocks) {
  return blocks
    .map((block, index) => {
      const type = String(block?.type ?? "").trim();
      const text = String(block?.text ?? "").trim();
      const imageDataUrl = String(block?.imageDataUrl ?? block?.image ?? "").trim();
      const imageName = String(block?.imageName ?? "").trim();

      const isText = type === "text" || (!type && text !== "");
      const isImage = type === "image" || (!type && imageDataUrl !== "");

      if (!isText && !isImage) {
        return null;
      }

      return {
        ordem: index + 1,
        type: isText ? "text" : "image",
        hasText: isText,
        hasImage: isImage,
        text,
        image: imageDataUrl,
        imageName: imageName || `imagem-${index + 1}`
      };
    })
    .filter((item) => item !== null);
}

function hasImageBlock(analysisBlocks) {
  if (!Array.isArray(analysisBlocks)) {
    return false;
  }

  return analysisBlocks.some(
    (block) =>
      (block?.hasImage || String(block?.type ?? "") === "image" || String(block?.image ?? "").trim() !== "") &&
      String(block?.image ?? "").trim() !== ""
  );
}

function buildPassoAPassoBlocks(blocks) {
  return blocks
    .map((block, index) => {
      const type = String(block?.type ?? "").trim();
      const imageDataUrl = String(block?.imageDataUrl ?? block?.image ?? "").trim();
      if (type && type !== "image") {
        return null;
      }
      if (!imageDataUrl) {
        return null;
      }

      return {
        ordem: index + 1,
        image: imageDataUrl
      };
    })
    .filter((item) => item !== null);
}

const base64Regex = /^(?:data:)?image\/png;base64,/i;
const validBase64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

function base64Parser(tagValue) {
  if (typeof tagValue !== "string" || !base64Regex.test(tagValue)) {
    throw new Error(
      "Formato de imagem invalido para geracao do DOCX. Reanexe a imagem para converter em PNG."
    );
  }

  const stringBase64 = tagValue.replace(base64Regex, "");
  if (!validBase64.test(stringBase64)) {
    throw new Error("Base64 de imagem invalido.");
  }

  const binaryString = window.atob(stringBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function createImageModule() {
  const imageOptions = {
    // In the free module, paragraph expansion for docx depends on this global flag.
    // Keeping it true avoids invalid XML when using centered image tags.
    centered: true,
    fileType: "docx",
    getImage(tagValue) {
      return base64Parser(tagValue);
    },
    getSize(_img, _tagValue, _tagName, context) {
      const containerWidth = context?.part?.containerWidth || 700;
      const width = Math.max(220, Math.round(containerWidth * 0.8));
      const height = Math.round(width * 0.62);
      return [width, height];
    }
  };

  return new ImageModule(imageOptions);
}

export async function generateDocumentBlob(templatePath, formValues) {
  const normalizedValues = normalizeData(formValues);
  const templateBuffer = await loadTemplateArrayBuffer(templatePath);
  const zip = new PizZip(templateBuffer);
  const containsImage =
    hasImageBlock(normalizedValues.analise) ||
    hasImageBlock(normalizedValues.passoapasso);
  const modules = [];

  if (containsImage) {
    modules.push(createImageModule());
  }

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    modules
  });

  doc.render(normalizedValues);

  return doc.getZip().generate({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  });
}

export function downloadBlob(blob, fileName) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(objectUrl);
}
