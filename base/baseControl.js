const customControl = {
  props: ["field", "showLabel"],
  setup(props) {
    const model = Vue.inject("model");
    model[props.field.id] = props.field.defaultValue ?? "";

    const dataSource = Vue.ref([]);
    const isHidden = Vue.computed(() => isUiHidden(props.field));

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

    return { model, dataSource, isHidden };
  },
  computed: {
    errors() {
      return ValidateGlobal(this.field, this.model);
    },
    mergedOptions() {
      const opts = this.field.options ?? [];
      const ds = this.dataSource ?? [];
      return [...opts, ...ds];
    },
  },
};
