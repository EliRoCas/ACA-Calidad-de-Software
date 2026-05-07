const DynamicDate = {
  components: { DynamicError },
  template: `
        <div :class="['field-group','col-12', field.class || '', field.hidden ? 'hidden' : '']">
          <label v-if="showLabel && field.label" :for="field.id">{{ field.label }}</label>

          <div class="custom-input">
            <input
              type="date"
              :id="field.id"
              v-model="model[field.id]"
              :disabled="field.readonly"
            />
          </div>

          <DynamicError :errors="errors" />
        </div>
      `,
  ...customControl
};