const DynamicRadio = {
  components: { DynamicError },
  template: `
        <div :class="['field-group','col-12', field.class || '', isHidden ? 'hidden' : '']">
          <label v-if="showLabel && field.label">{{ field.label }}</label>

          <div class="custom-input">
            <label v-for="opt in mergedOptions" :key="String(opt.value)">
              <input
                type="radio"
                :value="opt.value"
                v-model="model[field.id]"
                :disabled="field.readonly"
              />
              {{ opt.label }}
            </label>
          </div>

          <DynamicError :errors="errors" />
        </div>
      `,
  ...customControl
};
