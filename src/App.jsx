import { useMemo, useState } from "react";
import DynamicForm from "./components/DynamicForm";
import TemplateSelector from "./components/TemplateSelector";
import DocumentPreview from "./components/DocumentPreview";
import fieldConfig from "./config/fieldConfig.json";
import templates from "./config/templateConfig.json";
import { validateFields } from "./utils/validators";
import { generateDocumentBlob, downloadBlob } from "./services/docxService";
import { loadFormData, saveFormData } from "./services/storageService";

function getAutomaticData() {
  const now = new Date();
  const month = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(now);
  const mesAtual = month.charAt(0).toUpperCase() + month.slice(1);
  const anoAtual = String(now.getFullYear());
  const data = now.toLocaleDateString("pt-BR");
  return { mesAtual, anoAtual, data };
}

function buildOperatorSummaryText(values) {
  const line = (label, value) => `-- ${label}: ${String(value || "-")}`;
  return [
    String(values.nomeDFT || "Nome do DFT"),
    "",
    line("Ambiente", "Producao"),
    line("Perfil", values.perfilOperador),
    line("Usuario", values.loginOperador),
    line("Tipo de Jornada", values.jornada),
    line("Tipo do Cliente utilizado no teste", values.tipoContrato),
    line("Cliente utilizado no teste", values.cpfCliente),
    line("Caso do Solar", values.casoSolar),
    line("Chamado aberto pela operacao", values.chamadoOperador)
  ].join("\n");
}

async function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const tempTextarea = document.createElement("textarea");
  tempTextarea.value = text;
  tempTextarea.setAttribute("readonly", "");
  tempTextarea.style.position = "absolute";
  tempTextarea.style.left = "-9999px";
  document.body.appendChild(tempTextarea);
  tempTextarea.select();
  document.execCommand("copy");
  document.body.removeChild(tempTextarea);
}

function App() {
  const [values, setValues] = useState(() => loadFormData());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || "");
  const [status, setStatus] = useState("");

  const selectedTemplate = useMemo(
    () => templates.find((item) => item.id === selectedTemplateId),
    [selectedTemplateId]
  );

  const automaticData = getAutomaticData();

  const handleFieldChange = (name, value) => {
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);
    saveFormData(nextValues);

    if (errors[name]) {
      setErrors((previous) => ({ ...previous, [name]: undefined }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateFields(fieldConfig, values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setStatus("Corrija os campos obrigatorios antes de gerar o documento.");
      return;
    }

    if (!selectedTemplate) {
      setStatus("Nenhum template selecionado.");
      return;
    }

    setIsSubmitting(true);
    setStatus("");

    try {
      const payload = { ...values, ...automaticData };
      const blob = await generateDocumentBlob(selectedTemplate.path, payload);
      const safeName = (values.nomeDFT || values.nomeAnalista || "sem-nome").replace(/\s+/g, "-");
      const outputName = `${safeName}.docx`;
      downloadBlob(blob, outputName);
      setStatus(`Documento gerado com sucesso: ${outputName}`);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? `Nao foi possivel gerar o documento: ${error.message}`
          : "Nao foi possivel gerar o documento. Verifique o template e os dados."
      );
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySummary = async () => {
    try {
      const text = buildOperatorSummaryText(values);
      await copyToClipboard(text);
      setStatus("Texto copiado para a area de transferencia.");
    } catch {
      setStatus("Nao foi possivel copiar o texto automaticamente.");
    }
  };

  return (
    <main className="layout">
      <header className="hero">
        <h1>Gerador de Documentos Tecnicos - MOps Solar</h1>
        <p>
          Preencha as variaveis, selecione o template e baixe o arquivo final em formato
          <code> .docx</code>.
        </p>
      </header>

      <TemplateSelector
        templates={templates}
        selectedTemplateId={selectedTemplateId}
        onSelect={setSelectedTemplateId}
      />

      <DynamicForm
        fields={fieldConfig}
        values={values}
        errors={errors}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onCopySummary={handleCopySummary}
      />

      <DocumentPreview fields={fieldConfig} values={values} />

      {status ? <p className="status">{status}</p> : null}
    </main>
  );
}

export default App;
