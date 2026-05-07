const customControl = {
    props: ["field", "showLabel"],
    setup(props) {
        const model = Vue.inject("model");
        model[props.field.id] = props.field.defaultValue ?? "";

        const dataSource = Vue.ref([]);

        loadDataSource(props.field, model).then(result => {
            dataSource.value.length = 0;
            dataSource.value.push(...(result || []));
        });

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