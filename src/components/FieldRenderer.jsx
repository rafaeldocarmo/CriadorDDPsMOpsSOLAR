import AnalysisBlocksField from "./AnalysisBlocksField";

function FieldRenderer({ field, value, error, onChange }) {
  const shouldSpanThreeColumns = field.type === "analysisBlocks" || field.span === 3;
  const commonProps = {
    id: field.name,
    name: field.name,
    value: value ?? "",
    onChange: (event) => onChange(field.name, event.target.value),
    placeholder: field.placeholder || "",
    "aria-invalid": Boolean(error)
  };

  return (
    <div className={`field${shouldSpanThreeColumns ? " field-full" : ""}`}>
      <label htmlFor={field.name}>
        {field.label}
        {field.required ? " *" : ""}
      </label>

      {field.type === "textarea" ? (
        <textarea {...commonProps} rows={field.rows || 4} />
      ) : null}

      {field.type === "analysisBlocks" ? (
        <AnalysisBlocksField
          field={field}
          value={value}
          onChange={onChange}
        />
      ) : null}

      {field.type === "select" ? (
        <select {...commonProps}>
          <option value="">Selecione</option>
          {(field.options || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}

      {field.type !== "textarea" && field.type !== "select" && field.type !== "analysisBlocks" ? (
        <input {...commonProps} type={field.type || "text"} />
      ) : null}

      {error ? <small className="field-error">{error}</small> : null}
    </div>
  );
}

export default FieldRenderer;
