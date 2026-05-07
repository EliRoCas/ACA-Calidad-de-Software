function resolvePath(obj, path) {
  if (!path) return obj;
  return path.split(".").reduce((prev, curr) => (prev ? prev[curr] : undefined), obj);
}

function resolveTemplate(template, model = {}) {
  if (typeof template !== "string") return template;

  return template.replaceAll(/\{\{\s*([^}]+)\s*\}\}/g, (_, path) => {
    const value = resolvePath(model, path.trim());

    if (value === undefined || value === null) {
      return "";
    }

    return encodeURIComponent(String(value));
  });
}

function evaluateCondition(condition, allValues) {
  let evalStr = String(condition ?? "true");
  Object.entries(allValues).forEach(([k, v]) => {
    evalStr = evalStr.replaceAll(`{{${k}}}`, JSON.stringify(v));
  });
  try {
    return !!eval(evalStr);
  } catch {
    return false;
  }
}

const loadDataSource = async (field, model) => {
  if (field.dataSource /*&& !field.dependsOn*/) {
    const url = resolveTemplate(field.dataSource.url, model);
    const response = await fetch(url);

    if (response.ok) {
      let data = await response.json();

      if (field.dataSource.root) {
        data = resolvePath(data, field.dataSource.root);
      }

      const result = (data || []).map((item) => ({
        label: resolvePath(item, field.dataSource.map.label),
        value: resolvePath(item, field.dataSource.map.value),
      }));

      return result;
    }
  }

  return [];
};
