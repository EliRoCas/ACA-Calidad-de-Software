const ValidateGlobal = (field, model) => {
  return (field.validations ?? [])
    .map((validationInfo) => {
      const validation = Validations[validationInfo.type];

      if (validation) return validation(field, validationInfo, model);
      else
        return {
          type: "global",
          message: "Validation [" + validationInfo.type + "] doesnt exist.",
        };
    })
    .filter(Boolean);
};

const Validations = {
  required: (field, validation, model) => {
    if (isEmptyValue(model[field.id])) {
      return { type: "required", message: validation.message };
    }

    return undefined;
  },
  condition: (field, validation, model) => {
    if (!evaluateCondition(validation.condition ?? "true", model)) {
      return { type: "condition", message: validation.message };
    }

    return undefined;
  },
  range: (field, validation, model) => {
    if ((validation.params?.length ?? 0) < 2) {
      throw new Error("Range validation should have min and max params configured");
    }

    if (
      model[field.id] &&
      !(
        Number(model[field.id]) >= validation.params[0] &&
        Number(model[field.id]) <= validation.params[1]
      )
    ) {
      return { type: "range", message: validation.message };
    }

    return undefined;
  },
  requiredIf: (field, validation, model) => {
    if (
      evaluateCondition(validation.condition ?? "true", model) &&
      isEmptyValue(model[field.id])
    ) {
      return { type: "requiredIf", message: validation.message };
    }

    return undefined;
  },
  maxLength: (field, validation, model) => {
    if ((validation.params?.length ?? 0) < 1) {
      throw new Error("maxLength validation should have length param configured");
    }

    if ((model[field.id] ?? "").length > validation.params[0]) {
      return { type: "maxLength", message: validation.message };
    }

    return undefined;
  },
  personName: (field, validation, model) => {
    const value = model[field.id];

    if (isEmptyValue(value)) return undefined;

    if (!isValidPersonName(value)) {
      return { type: "personName", message: validation.message };
    }

    return undefined;
  },
  documentByType: (field, validation, model) => {
    const value = model[field.id];
    const typeField = validation.typeField ?? validation.params?.typeField ?? "tipo_doc";
    const docType = resolvePath(model, typeField);

    if (isEmptyValue(value)) return undefined;

    if (!isValidDocumentValue(value, docType)) {
      return { type: "documentByType", message: validation.message };
    }

    return undefined;
  },
  localPhone: (field, validation, model) => {
    const value = model[field.id];
    const prefixField = validation.prefixField ?? validation.params?.prefixField ?? "prefijoCel";
    const prefix = resolvePath(model, prefixField);

    if (isEmptyValue(value)) return undefined;

    if (!isValidLocalPhone(value, prefix)) {
      return { type: "localPhone", message: validation.message };
    }

    return undefined;
  },
  emailStrict: (field, validation, model) => {
    const value = model[field.id];

    if (isEmptyValue(value)) return undefined;

    if (!isValidEmailStrict(value)) {
      return { type: "emailStrict", message: validation.message };
    }

    return undefined;
  },
};
