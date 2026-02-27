function TemplateSelector({ templates, selectedTemplateId, onSelect }) {
  return (
    <section className="card">
      <h2>Template</h2>
      <p className="muted">Escolha qual modelo de documento deseja utilizar.</p>

      <div className="field">
        <label htmlFor="template">Template disponível</label>
        <select
          id="template"
          value={selectedTemplateId}
          onChange={(event) => onSelect(event.target.value)}
        >
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}

export default TemplateSelector;
