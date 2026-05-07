const DynamicHidden = {
  props: ["field"],
  setup(props) {
    const model = Vue.inject("model");
    model[props.field.id] = props.field.defaultValue ?? "";

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
