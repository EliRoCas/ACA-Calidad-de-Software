const { createApp, reactive, ref, computed, watch, onMounted } = Vue;

const vueApp = createApp({
  setup() {
    const schema = SCHEMA;

    Vue.provide("schema", schema);

    const model = Vue.inject("model");
    const validationState = Vue.inject("validationState");
    const payload = ref(null);
    const submitErrors = ref([]);
    const isSubmitting = ref(false);
    const submitStatus = ref("");
    const isAuthorizationAccepted = computed(
      () => model.data_authorization === true,
    );

    async function submit() {
      validationState.submitAttempted = true;
      submitErrors.value = getSubmitErrors(schema, Vue.toRaw(model));

      if (!isAuthorizationAccepted.value) {
        submitStatus.value = "Debes autorizar el tratamiento de datos personales.";
        return;
      }

      if (submitErrors.value.length > 0) {
        submitStatus.value = "Revisa los campos obligatorios antes de enviar.";
        return;
      }

      const nextPayload = buildSubmitPayload(schema, Vue.toRaw(model));
      payload.value = nextPayload;

      console.log("MVP SUBMIT PAYLOAD:", nextPayload);
      console.log(
        "GOOGLE FORM PAYLOAD:",
        Object.fromEntries(buildGoogleFormPayload(schema, nextPayload)),
      );

      isSubmitting.value = true;
      submitStatus.value = "Enviando MVP a Google Forms...";

      try {
        await submitGoogleForm(schema, nextPayload);
        submitStatus.value = "Envio MVP realizado. Revisa Google Forms.";
      } catch (error) {
        console.error("Google Forms submit failed:", error);
        submitStatus.value = "No fue posible enviar a Google Forms.";
      } finally {
        isSubmitting.value = false;
      }
    }

    watch(
      model,
      () => {
        if (!validationState.submitAttempted) return;

        submitErrors.value = getSubmitErrors(schema, Vue.toRaw(model));

        if (submitErrors.value.length === 0 && submitStatus.value.includes("Revisa")) {
          submitStatus.value = "";
        }
      },
      { deep: true },
    );

    const prettyValues = computed(() => JSON.stringify(model, null, 2));
    const prettyPayload = computed(() => JSON.stringify(payload.value, null, 2));

    return {
      schema,
      submit,
      submitErrors,
      isSubmitting,
      isAuthorizationAccepted,
      submitStatus,
      prettyValues,
      prettyPayload,
    };
  },
  template: `
        <DynamicSectionContainer :field="schema" />

        <div class="actions">
            <button @click="submit" :disabled="isSubmitting || !isAuthorizationAccepted">
              {{ isSubmitting ? 'Enviando...' : 'Enviar MVP' }}
            </button>
        </div>

        <p v-if="submitStatus">{{ submitStatus }}</p>

        <ul v-if="submitErrors.length">
          <li v-for="error in submitErrors" :key="error.fieldId + error.type">
            {{ error.label }}: {{ error.message }}
          </li>
        </ul>

        <pre>{{ prettyValues }}</pre>

        <pre v-if="prettyPayload">{{ prettyPayload }}</pre>
      `,
});

vueApp.use(DynamicFormPlugin, { debug: true });

vueApp.mount("#app");
