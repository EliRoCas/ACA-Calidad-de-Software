const DynamicText = {
  components: { DynamicError },
  template: `
        <div :class="['field-group','col-12', field.class || '', controlClasses, isHidden ? 'hidden' : '']">
          <label v-if="showLabel && field.label" :for="field.id">{{ field.label }}</label>

          <div class="custom-input">
            <input
              type="text"
              :id="field.id"
              v-model="model[field.id]"
              :disabled="!!field.readonly"
              @input="markTouched"
              @blur="markTouched"
            />
            <span v-if="field.format" class="end">{{ field.format }}</span>
          </div>

          <DynamicError :errors="visibleErrors" />
        </div>
      `,
  ...customControl
};
