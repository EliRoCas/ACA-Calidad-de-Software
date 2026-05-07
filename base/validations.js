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
};
