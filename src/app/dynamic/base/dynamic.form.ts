import { Component, effect, signal } from "@angular/core";
import { AbstractControl, FormControl } from "@angular/forms";
import { ValidationDetail } from "../models/lift-tracker";
import { DynamicControl } from "./dynamic-control";

@Component({
    selector: '[form-control]',
    template: `<ng-template #content></ng-template>`,
})
export abstract class DynamicForm extends DynamicControl {

    abstractControl = signal<AbstractControl>(new FormControl());

    constructor() {
        super();

        effect(() => {
            this.abstractControl.set(this.getNewAbstractControl());

            this.checkReadOnlyState();
            this.addValidations();
            this.addControlToGroup();


            // this.formControl().valueChanges.subscribe(value => {
            //     this.handleTriggers(field, value);
            //     this.handleCascades(field.id);
            // });

            if (this.initializeValue() !== null && this.initializeValue() !== undefined)
                this.abstractControl().setValue(this.initializeValue());
        })
    }

    abstract getNewAbstractControl(): AbstractControl;

    initializeValue() {
        return this.field().defaultValue?.toString() || '';
    }

    checkReadOnlyState() {
        if (this.field().readonly)
            this.abstractControl().disable();
    }

    addValidations() {
        const validations = this.field().validations
            ?.map(validation => {
                const val = this.dynamicConfigService.getValidation(validation.type);
                return { isGlobal: val.isGlobal, valdiationFn: val.value(this.field(), validation, this.formGroup()) }
            }) ?? [];

        this.abstractControl().addValidators(validations.filter(v => !v?.isGlobal).map(v => v?.valdiationFn));
        this.formGroup().addValidators(validations.filter(v => !!v?.isGlobal).map(v => v?.valdiationFn));
    }

    addControlToGroup() {
        this.formGroup().addControl(this.field().id, this.abstractControl());
    }

    public errors() {

        const globalErrors = Object
            .entries(this.formGroup().errors ?? {})
            .map(([key, detail]: [string, ValidationDetail]) => ({ key, detail }))
            .filter(error => error.detail.id === this.field().id);

        const controlErrors = Object
            .entries(this.abstractControl().errors ?? {})
            .map(([key, detail]: [string, ValidationDetail]) => ({ key, detail }));

        return [...globalErrors, ...controlErrors];
    }
}