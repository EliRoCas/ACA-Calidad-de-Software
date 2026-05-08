const DynamicSectionContainer = {
  props: ["field"],
  setup(props) {
    const model = Vue.inject("model");
    const isHidden = Vue.computed(() => isFieldHidden(props.field, model));

    return { isHidden };
  },
  template: `
        <div :class="['dynamic-container','col-12', field.class || '', isHidden ? 'hidden' : '']">
          <h2 v-if="field.label" class="col-12">{{ field.label }}</h2>

          <component
            v-for="child in orderedChildren"
            :key="child.id + '_' + (child.type || '') + '_' + (child.order ?? 0)"
            :is="child.type"
            :field="child"
            :showLabel="true"
          />
        </div>
      `,
  computed: {
    orderedChildren() { return [...this.field.children ?? []].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) }
  }
};
