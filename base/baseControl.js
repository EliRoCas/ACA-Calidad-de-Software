const customControl = {
  props: ["field", "showLabel"],
  setup(props) {
    const model = Vue.inject("model");
    const schema = Vue.inject("schema");
    const validationState = Vue.inject("validationState");

    if (model[props.field.id] === undefined) {
      model[props.field.id] = resolveInitialFieldValue(props.field, model, schema);
    }

    const dataSource = Vue.ref([]);
    const isHidden = Vue.computed(() => isFieldHidden(props.field, model));
    const errors = Vue.computed(() => ValidateGlobal(props.field, model));
    const hasValidations = Vue.computed(() => (props.field.validations ?? []).length > 0);
    const isTouched = Vue.computed(() => Boolean(validationState?.touched?.[props.field.id]));
    const showErrors = Vue.computed(() => Boolean(validationState?.submitAttempted) && errors.value.length > 0);
    const visibleErrors = Vue.computed(() => (showErrors.value ? errors.value : []));
    const isValid = Vue.computed(
      () =>
        hasValidations.value &&
        isTouched.value &&
        !isHidden.value &&
        errors.value.length === 0,
    );
    const controlClasses = Vue.computed(() => ({
      "is-invalid": showErrors.value,
      "is-valid": isValid.value,
    }));
    const mergedOptions = Vue.computed(() => [
      ...(props.field.options ?? []),
      ...dataSource.value,
    ]);

    const markTouched = (event) => {
      if (validationState) {
        validationState.touched[props.field.id] = true;
      }

      const target = event?.target;

      if (!target || target.type === "checkbox" || target.type === "radio") {
        return;
      }

      const sanitizedValue = sanitizeFieldValue(props.field, target.value, model);

      if (sanitizedValue !== target.value) {
        target.value = sanitizedValue;
        model[props.field.id] = sanitizedValue;
      }
    };

    const refreshDataSource = async () => {
      if (hasMissingDependencies(props.field, model)) {
        dataSource.value.length = 0;
        return;
      }

      const result = await loadDataSource(props.field, model);
      dataSource.value.length = 0;
      dataSource.value.push(...(result || []));
    };

    const dependencies = toArray(props.field.dependsOn);

    if (dependencies.length > 0) {
      Vue.watch(
        () => dependencies.map((dependency) => resolvePath(model, dependency)),
        async () => {
          model[props.field.id] = "";
          await refreshDataSource();
        },
        { immediate: true },
      );
    } else {
      refreshDataSource();
    }

    Vue.watch(
      () => model[props.field.id],
      () => {
        applyTriggers(props.field, model);
      },
      { immediate: true },
    );

    return {
      model,
      dataSource,
      isHidden,
      errors,
      visibleErrors,
      controlClasses,
      markTouched,
      mergedOptions,
    };
  },
};
