const STORAGE_KEY = "dft_form_values_v1";

export function loadFormData() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveFormData(values) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
}
