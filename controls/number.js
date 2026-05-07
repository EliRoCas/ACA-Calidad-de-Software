const DynamicNumber = {
  components: { DynamicError },
  template: `
        <div :class="['field-group','col-12', field.class || '', field.hidden ? 'hidden' : '']">
          <label v-if="showLabel && field.label" :for="field.id">{{ field.label }}</label>

          <div class="custom-input">
            <span class="start material-symbols-outlined">pin</span>
            <input
              type="number"
              :id="field.id"
              v-model.number="model[field.id]"
              :disabled="field.readonly"
            />
            <span v-if="field.format" class="end">{{ field.format }}</span>
          </div>

          <DynamicError :errors="errors" />
        </div>
      `,
  ...customControl
};