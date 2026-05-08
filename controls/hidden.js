const DynamicHidden = {
  props: ["field"],
  setup(props) {
    const model = Vue.inject("model");
    const schema = Vue.inject("schema");

    if (model[props.field.id] === undefined) {
      model[props.field.id] = resolveInitialFieldValue(props.field, model, schema);
    }

    return { model };
  },
  template: `
    <input
      type="hidden"
      :id="field.id"
      :name="field.payload?.name || field.id"
      v-model="model[field.id]"
    />
  `,
};
