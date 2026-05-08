const TRACKING_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_subsource",
  "articulo",
  "nevento",
  "fevento",
];

function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function resolvePath(obj, path) {
  if (!path) return obj;

  return path
    .split(".")
    .reduce((current, key) => (current ? current[key] : undefined), obj);
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

/**
 * Safe declarative condition evaluator.
 *
 * Preferred format:
 * {
 *   field: "customer_type",
 *   operator: "equals",
 *   value: "PN"
 * }
 */
function evaluateRule(rule, model = {}) {
  if (!rule) return true;

  const currentValue = resolvePath(model, rule.field);

  switch (rule.operator) {
    case "equals":
      return currentValue === rule.value;

    case "notEquals":
      return currentValue !== rule.value;

    case "includes":
      return Array.isArray(rule.value) && rule.value.includes(currentValue);

    case "exists":
      return !isEmptyValue(currentValue);

    case "notExists":
      return isEmptyValue(currentValue);

    case "lessThanOrEqualField": {
      const otherValue = resolvePath(model, rule.otherField);
      return Number(currentValue) <= Number(otherValue);
    }

    default:
      console.warn("Unsupported condition operator:", rule.operator);
      return false;
  }
}

/**
 * Legacy evaluator.
 *
 * This exists only to keep compatibility with old string conditions.
 * Prefer declarative condition objects for new MVP rules.
 */
function evaluateLegacyExpression(condition, model = {}) {
  let expression = String(condition ?? "true");

  expression = expression.replaceAll(/\{\{\s*([^}]+)\s*\}\}/g, (_, path) => {
    const value = resolvePath(model, path.trim());
    return JSON.stringify(value);
  });

  try {
    return Boolean(eval(expression));
  } catch (error) {
    console.warn("Invalid legacy condition:", condition, error);
    return false;
  }
}

function evaluateCondition(condition, model = {}) {
  if (condition === undefined || condition === null || condition === "") {
    return true;
  }

  if (typeof condition === "boolean") {
    return condition;
  }

  if (typeof condition === "object") {
    return evaluateRule(condition, model);
  }

  if (typeof condition === "string") {
    return evaluateLegacyExpression(condition, model);
  }

  return false;
}

function applyTriggers(field, model) {
  if (!Array.isArray(field.triggers)) {
    return;
  }

  field.triggers.forEach((trigger) => {
    if (trigger.action !== "setValue") {
      return;
    }

    const shouldApply = evaluateCondition(trigger.condition ?? true, model);

    if (!shouldApply) {
      return;
    }

    if (!trigger.target) {
      console.warn("Trigger action 'setValue' requires a target field id:", trigger);
      return;
    }

    model[trigger.target] = trigger.value;
  });
}

function hasMissingDependencies(field, model = {}) {
  const dependencies = toArray(field.dependsOn);

  return dependencies.some((dependency) => {
    return isEmptyValue(resolvePath(model, dependency));
  });
}

function collectFormFields(field, fields = []) {
  if (!field) {
    return fields;
  }

  const hasChildren = Array.isArray(field.children) && field.children.length > 0;
  const isContainer = field.type === "section-container";

  if (field.id && !hasChildren && !isContainer) {
    fields.push(field);
  }

  (field.children ?? []).forEach((child) => collectFormFields(child, fields));

  return fields;
}

function getPayloadName(field) {
  return field.payload?.name ?? field.id;
}

function shouldIncludeInPayload(field) {
  return field.payload?.include !== false;
}

function isFieldHidden(field, model = {}) {
  const hasStaticHidden = field.hidden === true || field.ui?.hidden === true;
  const hiddenWhen = field.ui?.hiddenWhen;
  const visibleWhen = field.ui?.visibleWhen;

  return (
    hasStaticHidden ||
    (hiddenWhen ? evaluateCondition(hiddenWhen, model) : false) ||
    (visibleWhen ? !evaluateCondition(visibleWhen, model) : false)
  );
}

function isHiddenPayloadField(field, model = {}) {
  return field.type === "hidden" || isFieldHidden(field, model);
}

function buildFieldValues(fields, model, filter = () => true) {
  return fields
    .filter(filter)
    .filter(shouldIncludeInPayload)
    .reduce((values, field) => {
      const payloadName = getPayloadName(field);
      values[payloadName] = model[field.id] ?? "";
      return values;
    }, {});
}

function extractTrackingValuesFromLocation(locationSearch = "", defaults = {}) {
  const queryParams = new URLSearchParams(locationSearch);

  return TRACKING_PARAM_KEYS.reduce((trackingValues, key) => {
    trackingValues[key] = queryParams.get(key) ?? defaults[key] ?? "";
    return trackingValues;
  }, {});
}

function buildSubmitPayload(schema, model, options = {}) {
  const formFields = collectFormFields(schema);
  const submittedAt = options.submittedAt ?? new Date().toISOString();
  const locationSearch =
    options.locationSearch ?? globalThis.window?.location?.search ?? "";
  const trackingDefaults = options.trackingDefaults ?? schema?.tracking ?? {};

  return {
    formId: schema?.id ?? null,
    submittedAt,
    values: buildFieldValues(
      formFields,
      model,
      (field) => !isHiddenPayloadField(field, model),
    ),
    hiddenFields: buildFieldValues(
      formFields,
      model,
      (field) => isHiddenPayloadField(field, model),
    ),
    tracking: extractTrackingValuesFromLocation(locationSearch, trackingDefaults),
  };
}

function getSubmitErrors(schema, model) {
  return collectFormFields(schema)
    .filter((field) => !isFieldHidden(field, model))
    .flatMap((field) =>
      ValidateGlobal(field, model).map((error) => ({
        fieldId: field.id,
        label: field.label ?? field.id,
        ...error,
      })),
    );
}

function flattenSubmitPayload(payload) {
  return {
    ...(payload?.values ?? {}),
    ...(payload?.hiddenFields ?? {}),
    ...(payload?.tracking ?? {}),
  };
}

function buildGoogleFormPayload(schema, payload) {
  const entries = schema?.submit?.google?.entries ?? {};
  const values = flattenSubmitPayload(payload);
  const formBody = new URLSearchParams();

  Object.entries(entries).forEach(([payloadName, entryName]) => {
    formBody.append(entryName, values[payloadName] ?? "");
  });

  return formBody;
}

async function submitGoogleForm(schema, payload) {
  const endpoint = schema?.submit?.google?.endpoint;

  if (!endpoint) {
    throw new Error("Google Forms endpoint is not configured.");
  }

  await fetch(endpoint, {
    method: "POST",
    mode: "no-cors",
    body: buildGoogleFormPayload(schema, payload),
  });
}

const loadDataSource = async (field, model = {}) => {
  if (!field.dataSource) {
    return [];
  }

  if (hasMissingDependencies(field, model)) {
    return [];
  }

  const url = resolveTemplate(field.dataSource.url, model);
  const response = await fetch(url);

  if (!response.ok) {
    console.warn("DataSource request failed:", url);
    return [];
  }

  let data = await response.json();

  if (field.dataSource.root) {
    data = resolvePath(data, field.dataSource.root);
  }

  return (data || []).map((item) => ({
    label: resolvePath(item, field.dataSource.map.label),
    value: resolvePath(item, field.dataSource.map.value),
  }));
};
