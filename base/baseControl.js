const customControl = {
    props: ["field", "showLabel"],
    setup(props) {
        const model = Vue.inject("model");
        model[props.field.id] = props.field.defaultValue ?? "";

        const dataSource = Vue.ref([]);

        const refreshDataSource = async () => {
            if (props.field.dependsOn && isEmptyValue(model[props.field.dependsOn])) {
                dataSource.value.length = 0;
                return;
            }

            const result = await loadDataSource(props.field, model);
            dataSource.value.length = 0;
            dataSource.value.push(...(result || []));
        };

        if (props.field.dependsOn) {
            Vue.watch(
                () => model[props.field.dependsOn],
                async () => {
                    model[props.field.id] = "";
                    await refreshDataSource();
                },
                { immediate: true }
            );
        } else {
            refreshDataSource();
        }

        Vue.watch(
            () => model[props.field.id],
            () => {
                applyTriggers(props.field, model);
            },
            { immediate: true }
        );

        return { model, dataSource };
    },
    computed: {
        errors() {
            return ValidateGlobal(this.field, this.model);
        },
        mergedOptions() {
            const opts = this.field.options ?? [];
            const ds = this.dataSource ?? [];
            return [...opts, ...ds];
        }
    }

}