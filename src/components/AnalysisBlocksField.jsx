import { useRef, useState } from "react";

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createTextBlock() {
  return { id: makeId(), type: "text", text: "" };
}

function createImageBlock(imageDataUrl = "", imageName = "") {
  return { id: makeId(), type: "image", imageDataUrl, imageName };
}

function normalizeBlocks(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((block) => {
      if (block?.type === "text") {
        return { id: block.id || makeId(), type: "text", text: String(block.text ?? "") };
      }
      if (block?.type === "image") {
        return {
          id: block.id || makeId(),
          type: "image",
          imageDataUrl: String(block.imageDataUrl ?? block.image ?? ""),
          imageName: String(block.imageName ?? "")
        };
      }
      return null;
    })
    .filter(Boolean);
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function toPngFileName(fileName) {
  const name = String(fileName || "imagem").replace(/\.[^.]+$/, "");
  return `${name}.png`;
}

function dataUrlToPngDataUrl(dataUrl) {
  if (typeof dataUrl !== "string" || dataUrl.startsWith("data:image/png;base64,")) {
    return Promise.resolve(dataUrl);
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth || image.width || 1;
      canvas.height = image.naturalHeight || image.height || 1;
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Nao foi possivel processar a imagem."));
        return;
      }
      context.drawImage(image, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => reject(new Error("Nao foi possivel converter a imagem para PNG."));
    image.src = dataUrl;
  });
}

function AnalysisBlocksField({ field, value, onChange }) {
  const [dragIndex, setDragIndex] = useState(null);
  const addImageInputRef = useRef(null);

  const allowedTypes = Array.isArray(field.allowedTypes) ? field.allowedTypes : ["text", "image"];
  const allowText = allowedTypes.includes("text");
  const allowImage = allowedTypes.includes("image");
  const blocks = normalizeBlocks(value).filter((block) => allowedTypes.includes(block.type));

  const updateBlocks = (nextBlocks) => {
    onChange(field.name, nextBlocks);
  };

  const handleAddTextBlock = () => {
    if (!allowText) {
      return;
    }
    updateBlocks([...blocks, createTextBlock()]);
  };

  const handleRemoveBlock = (index) => {
    updateBlocks(blocks.filter((_, blockIndex) => blockIndex !== index));
  };

  const handleUpdateBlock = (index, patch) => {
    updateBlocks(
      blocks.map((block, blockIndex) =>
        blockIndex === index ? { ...block, ...patch } : block
      )
    );
  };

  const moveBlock = (fromIndex, toIndex) => {
    if (toIndex == null || fromIndex === toIndex) {
      return;
    }

    const nextBlocks = [...blocks];
    const [moved] = nextBlocks.splice(fromIndex, 1);
    nextBlocks.splice(toIndex, 0, moved);
    updateBlocks(nextBlocks);
  };

  const normalizeImageFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      return null;
    }
    const originalDataUrl = await readAsDataUrl(file);
    const imageDataUrl = await dataUrlToPngDataUrl(originalDataUrl);
    return { imageDataUrl, imageName: toPngFileName(file.name) };
  };

  const addImageBlockFromFile = async (file) => {
    const image = await normalizeImageFile(file);
    if (!image) {
      return;
    }
    updateBlocks([...blocks, createImageBlock(image.imageDataUrl, image.imageName)]);
  };

  const replaceImageInBlock = async (index, file) => {
    const image = await normalizeImageFile(file);
    if (!image) {
      return;
    }
    handleUpdateBlock(index, image);
  };

  return (
    <div className="analysis-blocks">
      {blocks.length === 0 ? <p className="muted">Nenhum bloco adicionado.</p> : null}

      {blocks.map((block, index) => (
        <div
          key={block.id || `analysis-block-${index}`}
          className="analysis-block-item"
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => {
            moveBlock(dragIndex, index);
            setDragIndex(null);
          }}
        >
          <button
            type="button"
            className="drag-handle"
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragEnd={() => setDragIndex(null)}
            aria-label={`Arrastar bloco ${index + 1}`}
          >
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </button>

          <div className="analysis-block-content">
            <button
              type="button"
              className="remove-btn"
              onClick={() => handleRemoveBlock(index)}
              aria-label={`Remover bloco ${index + 1}`}
            >
              x
            </button>

            {block.type === "text" ? (
              <textarea
                rows={4}
                value={block.text ?? ""}
                placeholder="Texto descritivo"
                onChange={(event) => handleUpdateBlock(index, { text: event.target.value })}
              />
            ) : null}

            {block.type === "image" ? (
              <div
                className="image-dropzone"
                onClick={(event) => {
                  const input = event.currentTarget.querySelector("input");
                  if (input) {
                    input.click();
                  }
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  replaceImageInBlock(index, event.dataTransfer?.files?.[0]);
                }}
              >
                {block.imageDataUrl ? (
                  <img className="image-preview" src={block.imageDataUrl} alt={block.imageName || "Imagem anexada"} />
                ) : (
                  <p className="muted">Clique ou arraste uma imagem aqui.</p>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden-file-input"
                  onChange={(event) => replaceImageInBlock(index, event.target.files?.[0])}
                />
              </div>
            ) : null}
          </div>
        </div>
      ))}

      <div className="analysis-add-actions">
        {allowImage ? (
          <>
            <button
              type="button"
              className="action-btn action-image"
              onClick={() => addImageInputRef.current?.click()}
            >
              {field.addImageLabel || "Adicionar bloco com imagem"}
            </button>
            <input
              ref={addImageInputRef}
              type="file"
              accept="image/*"
              className="hidden-file-input"
              onChange={(event) => addImageBlockFromFile(event.target.files?.[0])}
            />
          </>
        ) : null}

        {allowText ? (
          <button type="button" className="action-btn action-text" onClick={handleAddTextBlock}>
            {field.addTextLabel || "Adicionar bloco de texto"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default AnalysisBlocksField;
