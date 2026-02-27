import FieldRenderer from "./FieldRenderer";

function groupFieldsBySection(fields) {
  return fields.reduce((acc, field) => {
    const section = field.section || "Geral";
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(field);
    return acc;
  }, {});
}

function DynamicForm({
  fields,
  values,
  errors,
  onFieldChange,
  onSubmit,
  isSubmitting,
  onCopySummary
}) {
  const groupedFields = groupFieldsBySection(fields);

  return (
    <form className="card" onSubmit={onSubmit}>
      <h2>Dados Variáveis</h2>
      <p className="muted">Preencha os campos abaixo para gerar o documento.</p>

      {Object.entries(groupedFields).map(([section, sectionFields]) => (
        <section key={section} className="form-section">
          <h3>{section}</h3>
          <div className="grid">
            {sectionFields.map((field) => (
              <FieldRenderer
                key={field.name}
                field={field}
                value={values[field.name]}
                error={errors[field.name]}
                onChange={onFieldChange}
              />
            ))}
          </div>
        </section>
      ))}

      <div className="form-actions">
        <button
          className="action-btn"
          type="button"
          onClick={onCopySummary}
          disabled={isSubmitting}
        >
          Copiar texto para operacao
        </button>
        <button className="primary-btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Gerando..." : "Gerar e baixar .docx"}
        </button>
      </div>
    </form>
  );
}

export default DynamicForm;
