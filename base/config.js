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

        const model = Vue.reactive({});
        app.provide("model", model);

        // app.config.globalProperties.$model = model;
    }
};