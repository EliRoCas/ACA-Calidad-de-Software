const { createApp, reactive, ref, computed, watch, onMounted } = Vue;

const vueApp = createApp({
  setup() {
    const schema = SCHEMA;

    const model = Vue.inject("model");
    const payload = ref(null);

    function submit() {
      const nextPayload = buildSubmitPayload(schema, Vue.toRaw(model));
      payload.value = nextPayload;
      console.log("MOCK SUBMIT PAYLOAD:", nextPayload);
      alert("Mock submit ready. Check console or the payload preview.");
    }

    const prettyValues = computed(() => JSON.stringify(model, null, 2));
    const prettyPayload = computed(() => JSON.stringify(payload.value, null, 2));

    return {
      schema,
      submit,
      prettyValues,
      prettyPayload,
    };
  },
  template: `
        <DynamicSectionContainer :field="schema" />

        <div class="actions">
            <button @click="submit">Submit</button>
        </div>

        <pre>{{ prettyValues }}</pre>

        <pre v-if="prettyPayload">{{ prettyPayload }}</pre>
      `,
});

vueApp.use(DynamicFormPlugin, { debug: true });

vueApp.mount("#app");
