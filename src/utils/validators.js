export function validateFields(fieldConfig, values) {
  const errors = {};

  fieldConfig.forEach((field) => {
    if (!field.required) {
      return;
    }

    const value = values[field.name];
    const isEmpty =
      field.type === "analysisBlocks"
        ? (() => {
            const blocks = Array.isArray(value) ? value : [];
            const allowedTypes = Array.isArray(field.allowedTypes)
              ? field.allowedTypes
              : ["text", "image"];

            if (blocks.length === 0) {
              return true;
            }

            return blocks.some((block) => {
              const type = String(block?.type ?? "").trim();
              const textEmpty = String(block?.text ?? "").trim() === "";
              const imageEmpty = String(block?.imageDataUrl ?? block?.image ?? "").trim() === "";

              if (type === "text") {
                return !allowedTypes.includes("text") || textEmpty;
              }

              if (type === "image") {
                return !allowedTypes.includes("image") || imageEmpty;
              }

              if (allowedTypes.length === 1 && allowedTypes[0] === "image") {
                return imageEmpty;
              }

              return textEmpty && imageEmpty;
            });
          })()
        : String(value ?? "").trim() === "";

    if (isEmpty) {
      errors[field.name] = "Campo obrigatório.";
    }
  });

  return errors;
}
