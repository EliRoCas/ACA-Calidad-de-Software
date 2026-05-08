const DynamicSelect = {
  components: { DynamicError },
  template: `
        <div :class="['field-group','col-12', field.class || '', controlClasses, isHidden ? 'hidden' : '']">
          <label v-if="showLabel && field.label" :for="field.id">{{ field.label }}</label>

          <select
            :id="field.id"
            v-model="model[field.id]"
            :disabled="field.readonly"
            @change="markTouched"
            @blur="markTouched"
          >
            <option value="" disabled>{{ field.placeholder || 'Selecciona' }}</option>
            <option v-for="opt in mergedOptions" :key="String(opt.value)" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>

          <DynamicError :errors="visibleErrors" />
        </div>
      `,
  ...customControl
};
