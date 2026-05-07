const DynamicSectionContainer = {
  props: ["field"],
  template: `
        <div :class="['dynamic-container','col-12', field.class || '', field.hidden ? 'hidden' : '']">
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