const DynamicError = {
  props: { errors: { type: Array, required: true } },
  template: `
        <ul v-if="errors.length" class="dynamic-error">
          <li v-for="(e, idx) in errors" :key="idx">{{ e.message }}</li>
        </ul>
      `
};