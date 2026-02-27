function getAnalysisBlocksSummary(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return "-";
  }

  const textCount = value.filter((block) => String(block?.type ?? "") === "text").length;
  const imageCount = value.filter((block) => String(block?.type ?? "") === "image").length;
  const validBlocks = value.filter((block) => {
    const text = String(block?.text ?? "").trim();
    const image = String(block?.imageDataUrl ?? block?.image ?? "").trim();
    return text !== "" || image !== "";
  });

  if (validBlocks.length === 0) {
    return "-";
  }

  if (textCount === 0) {
    return `${validBlocks.length} passo(s) com imagem`;
  }

  return `${validBlocks.length} bloco(s) (${textCount} texto, ${imageCount} imagem)`;
}

function DocumentPreview({ fields, values }) {
  return (
    <section className="card">
      <h2>Preview dos dados</h2>
      <p className="muted">Conferência rápida antes do download do documento final.</p>

      <div className="preview-list">
        {fields.map((field) => (
          <div key={field.name} className="preview-item">
            <strong>{field.label}</strong>
            <span>
              {field.type === "analysisBlocks"
                ? getAnalysisBlocksSummary(values[field.name])
                : values[field.name] || "-"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default DocumentPreview;
