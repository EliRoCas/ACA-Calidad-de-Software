const DynamicFormPlugin = {
    install(app, options = {}) {
        console.log("Dynamic form plugin installed:", options);

        app.component("DynamicSectionContainer", DynamicSectionContainer);
        app.component("section-container", DynamicSectionContainer);
        app.component("text", DynamicText);
        app.component("number", DynamicNumber);
        app.component("select", DynamicSelect);
        app.component("radio", DynamicRadio);
        app.component("checkbox", DynamicCheckbox);
        app.component("date", DynamicDate);
        app.component("hidden", DynamicHidden);

        const model = Vue.reactive({});
        const validationState = Vue.reactive({
            submitAttempted: false,
            touched: {},
        });

        app.provide("model", model);
        app.provide("validationState", validationState);

        // app.config.globalProperties.$model = model;
    }
};
