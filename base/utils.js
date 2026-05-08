const TRACKING_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_subsource",
  "articulo",
  "nevento",
  "fevento",
];

const ACADEMIC_LEVEL_LABELS = {
  PREG: "Pregrado",
  GRAD: "Posgrado",
  ECLE: "Educacion continua",
  ETDH: "Educacion para el trabajo",
};

const PERSON_NAME_PATTERN =
  /^[A-Za-z\u00c1\u00c9\u00cd\u00d3\u00da\u00e1\u00e9\u00ed\u00f3\u00fa\u00dc\u00fc\u00d1\u00f1]+(?:\s+[A-Za-z\u00c1\u00c9\u00cd\u00d3\u00da\u00e1\u00e9\u00ed\u00f3\u00fa\u00dc\u00fc\u00d1\u00f1]+)*$/;

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

    case "allExist":
      return toArray(rule.fields).every((field) => {
        return !isEmptyValue(resolvePath(model, field));
      });

    case "anyExists":
      return toArray(rule.fields).some((field) => {
        return !isEmptyValue(resolvePath(model, field));
      });

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

function sanitizePersonName(value) {
  return String(value ?? "")
    .replace(
      /[^A-Za-z\u00c1\u00c9\u00cd\u00d3\u00da\u00e1\u00e9\u00ed\u00f3\u00fa\u00dc\u00fc\u00d1\u00f1\s]/g,
      "",
    )
    .replace(/\s+/g, " ");
}

function isValidPersonName(value) {
  const name = String(value ?? "").trim();
  return Boolean(name) && PERSON_NAME_PATTERN.test(name);
}

function normalizePhoneCode(phoneCode) {
  return String(phoneCode ?? "").replace(/\D/g, "");
}

function normalizeLocalPhone(value, selectedPrefix) {
  let sanitized = String(value ?? "").replace(/\D/g, "");
  const prefix = normalizePhoneCode(selectedPrefix);
  const rawValue = String(value ?? "");
  const looksInternational =
    rawValue.trim().startsWith("+") ||
    sanitized.startsWith(`00${prefix}`) ||
    (prefix && sanitized.startsWith(prefix) && sanitized.length > 10);

  if (prefix && looksInternational) {
    if (sanitized.startsWith(`00${prefix}`)) {
      sanitized = sanitized.slice(2 + prefix.length);
    } else if (sanitized.startsWith(prefix)) {
      sanitized = sanitized.slice(prefix.length);
    }
  }

  return sanitized.slice(0, 10);
}

function isFakePhoneNumber(value) {
  const phone = String(value ?? "");

  return (
    /^(\d)\1+$/.test(phone) ||
    ["0123456789", "1234567890", "9876543210"].includes(phone)
  );
}

function isValidLocalPhone(value, selectedPrefix) {
  const rawValue = String(value ?? "");
  const rawDigits = rawValue.replace(/\D/g, "");
  const prefix = normalizePhoneCode(selectedPrefix);
  const phone = normalizeLocalPhone(rawValue, selectedPrefix);

  if (prefix && (rawDigits === prefix || rawDigits === `00${prefix}`)) {
    return false;
  }

  if (
    prefix &&
    rawDigits.startsWith(prefix) &&
    rawDigits.slice(prefix.length).length === 10
  ) {
    return false;
  }

  if (
    prefix &&
    rawDigits.startsWith(`00${prefix}`) &&
    rawDigits.slice(2 + prefix.length).length === 10
  ) {
    return false;
  }

  const startsWithPrefixAsLocal =
    prefix &&
    rawDigits.startsWith(prefix) &&
    rawDigits.length > prefix.length &&
    !rawValue.trim().startsWith("+") &&
    !rawDigits.startsWith(`00${prefix}`) &&
    rawDigits === phone;

  return (
    !startsWithPrefixAsLocal &&
    /^\d{10}$/.test(phone) &&
    !isFakePhoneNumber(phone)
  );
}

function sanitizeDocumentValue(value, docType) {
  const rawValue = String(value ?? "");

  if (["CC", "TI"].includes(docType)) {
    return rawValue.replace(/\D/g, "").slice(0, 20);
  }

  return rawValue.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 20);
}

function isValidDocumentValue(value, docType) {
  const doc = String(value ?? "");

  if (!doc) return false;

  if (["CC", "TI"].includes(docType)) {
    return /^\d{5,20}$/.test(doc);
  }

  return /^[A-Z0-9]{5,20}$/.test(doc);
}

function sanitizeEmail(value) {
  return String(value ?? "").replace(/\s/g, "").toLowerCase();
}

function isValidEmailStrict(value) {
  const email = String(value ?? "").trim();
  if (!email) return false;
  if (/\s/.test(email)) return false;

  const atMatches = email.match(/@/g) || [];
  if (atMatches.length !== 1) return false;

  const [localPart, domainPart] = email.split("@");
  if (!localPart || !domainPart) return false;
  if (localPart.includes("..") || domainPart.includes("..")) return false;

  if (
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    domainPart.startsWith(".") ||
    domainPart.endsWith(".")
  ) {
    return false;
  }

  if (!/^[A-Za-z0-9._%+-]+$/.test(localPart)) return false;
  if (!/^(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/.test(domainPart)) return false;

  return !domainPart
    .split(".")
    .some((label) => label.startsWith("-") || label.endsWith("-"));
}

function sanitizeEventDate(value) {
  if (typeof value !== "string" || !value.trim()) return "";

  const normalized = value
    .normalize("NFKC")
    .replace(/\u00A0/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();
  const isoDateMatch = normalized.match(/\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/);
  const localDateMatch = normalized.match(/\b(\d{1,2})[-/](\d{1,2})[-/](\d{4})\b/);
  const dateMatch = isoDateMatch || localDateMatch;

  if (!dateMatch) return "";

  const [, first, second, third] = dateMatch;
  const year = isoDateMatch ? first : third;
  const month = isoDateMatch ? second : second;
  const day = isoDateMatch ? third : first;

  if (!isValidDateParts(year, month, day)) return "";

  const timeMatch = normalized.match(
    /\b(\d{1,2})(?::(\d{2})(?::\d{2})?)?\s*([AaPp])\s*\.?\s*[Mm]\s*\.?\b/,
  );

  if (!timeMatch) return "";

  const [, rawHour, rawMinute = "00", meridiem] = timeMatch;
  const hour = Number(rawHour);
  const minute = Number(rawMinute);

  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return "";

  const suffix = meridiem.toLowerCase() === "a" ? "a.\u00A0m." : "p.\u00A0m.";

  return `${padDatePart(day)}/${padDatePart(month)}/${year}, ${padDatePart(hour)}:${padDatePart(minute)} ${suffix}`;
}

function padDatePart(value) {
  return String(value).padStart(2, "0");
}

function isValidDateParts(year, month, day) {
  const yearNumber = Number(year);
  const monthNumber = Number(month);
  const dayNumber = Number(day);
  const date = new Date(Date.UTC(yearNumber, monthNumber - 1, dayNumber));

  return (
    /^\d{4}$/.test(String(year)) &&
    monthNumber >= 1 &&
    monthNumber <= 12 &&
    dayNumber >= 1 &&
    dayNumber <= 31 &&
    date.getUTCFullYear() === yearNumber &&
    date.getUTCMonth() === monthNumber - 1 &&
    date.getUTCDate() === dayNumber
  );
}

function resolveEventDateValue(configDate = "", locationSearch = "") {
  const queryParams = new URLSearchParams(locationSearch);
  const urlEventDate = queryParams.has("fevento")
    ? queryParams.get("fevento")
    : "";
  const eventDate = urlEventDate || configDate || "";

  return eventDate ? sanitizeEventDate(eventDate) : "";
}

function sanitizeFieldValue(field, value, model = {}) {
  const sanitizer = field.sanitize;
  const type = typeof sanitizer === "string" ? sanitizer : sanitizer?.type;
  const params = typeof sanitizer === "object" ? sanitizer : {};

  switch (type) {
    case "personName":
      return sanitizePersonName(value);

    case "documentByType":
      return sanitizeDocumentValue(
        value,
        resolvePath(model, params.typeField ?? "tipo_doc"),
      );

    case "localPhone":
      return normalizeLocalPhone(
        value,
        resolvePath(model, params.prefixField ?? "prefijoCel"),
      );

    case "email":
      return sanitizeEmail(value);

    case "eventDate":
      return sanitizeEventDate(value);

    default:
      return value;
  }
}

function resolveInitialFieldValue(field, model = {}, schema = {}) {
  const source = field.defaultFrom;

  if (source?.type === "eventDate") {
    const configDate = resolvePath(
      schema,
      source.configPath ?? "tracking.fevento",
    );

    return resolveEventDateValue(
      configDate ?? field.defaultValue ?? "",
      globalThis.window?.location?.search ?? "",
    );
  }

  return normalizeFieldValue(field, field.defaultValue ?? "", model);
}

function normalizeFieldValue(field, value, model = {}) {
  const sanitizedValue = sanitizeFieldValue(field, value, model);

  return typeof sanitizedValue === "string" ? sanitizedValue.trim() : sanitizedValue;
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
      values[payloadName] = normalizeFieldValue(field, model[field.id] ?? "", model);
      return values;
    }, {});
}

function extractTrackingValuesFromLocation(locationSearch = "", defaults = {}) {
  const queryParams = new URLSearchParams(locationSearch);

  return TRACKING_PARAM_KEYS.reduce((trackingValues, key) => {
    if (key === "fevento") {
      trackingValues[key] = resolveEventDateValue(defaults[key], locationSearch);
      return trackingValues;
    }

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

function transformAcademicLevels(data) {
  return Object.keys(data ?? {}).map((code) => ({
    label: ACADEMIC_LEVEL_LABELS[code] ?? code,
    value: code,
  }));
}

function transformAcademicFaculties(data, model = {}) {
  const faculties = data?.[model.nivelacademico] ?? {};

  return Object.keys(faculties).map((name) => ({
    label: name,
    value: faculties[name]?.FacultadCodigo ?? name,
  }));
}

function transformAcademicPrograms(data, model = {}) {
  const faculties = data?.[model.nivelacademico] ?? {};
  const faculty =
    faculties[model.facultad] ??
    Object.values(faculties).find(
      (item) => item?.FacultadCodigo === model.facultad,
    );
  const programs = faculty?.Programas ?? [];

  return programs.map((program) => ({
    label: program.Nombre,
    value: program.Codigo,
  }));
}

function transformAcademicPeriods(data, model = {}) {
  const periods = data?.[model.nivelacademico] ?? {};

  return Object.entries(periods).map(([label, value]) => ({
    label,
    value,
  }));
}

function transformDataSource(transform, data, model = {}) {
  switch (transform) {
    case "academicLevels":
      return transformAcademicLevels(data);

    case "academicFaculties":
      return transformAcademicFaculties(data, model);

    case "academicPrograms":
      return transformAcademicPrograms(data, model);

    case "academicPeriods":
      return transformAcademicPeriods(data, model);

    default:
      console.warn("Unsupported dataSource transform:", transform);
      return [];
  }
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

  if (field.dataSource.transform) {
    return transformDataSource(field.dataSource.transform, data, model);
  }

  return (data || []).map((item) => ({
    label: resolvePath(item, field.dataSource.map.label),
    value: resolvePath(item, field.dataSource.map.value),
  }));
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    buildGoogleFormPayload,
    buildSubmitPayload,
    collectFormFields,
    extractTrackingValuesFromLocation,
    flattenSubmitPayload,
    isValidEmailStrict,
    isValidPersonName,
    normalizeLocalPhone,
    resolveEventDateValue,
    sanitizeDocumentValue,
    sanitizeEmail,
    sanitizeEventDate,
    sanitizePersonName,
  };
}
