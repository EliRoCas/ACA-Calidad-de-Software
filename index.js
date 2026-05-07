const { createApp, reactive, ref, computed, watch, onMounted } = Vue;

const vueApp = createApp({
    setup() {
        const schema = SCHEMA;

        model = Vue.inject('model');

        function submit() {
            console.log("SUBMIT VALUES:", JSON.parse(JSON.stringify(model)));
            alert("Submitted! Check console for values.");
        }

        const prettyValues = computed(() => JSON.stringify(model, null, 2));

        return {
            schema,
            submit,
            prettyValues,
        };
    },
    template: `
        <DynamicSectionContainer :field="schema" />

        <div class="actions">
            <button @click="submit">Submit</button>
        </div>

        <pre>{{ prettyValues }}</pre>
      `
});

vueApp.use(DynamicFormPlugin, { debug: true });

vueApp.mount("#app");