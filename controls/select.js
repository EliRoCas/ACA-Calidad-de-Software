const DynamicSelect = {
  components: { DynamicError },
  template: `
        <div :class="['field-group','col-12', field.class || '', field.hidden ? 'hidden' : '']">
          <label v-if="showLabel && field.label" :for="field.id">{{ field.label }}</label>

          <select
            :id="field.id"
            v-model="model[field.id]"
            :disabled="field.readonly"
          >
            <option value=""></option>
            <option v-for="opt in mergedOptions" :key="String(opt.value)" :value="String(opt.value)">
              {{ opt.label }}
            </option>
          </select>

          <DynamicError :errors="errors" />
        </div>
      `,
  ...customControl
};