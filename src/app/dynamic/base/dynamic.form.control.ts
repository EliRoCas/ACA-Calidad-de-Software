import { Component, computed } from "@angular/core";
import { FormControl } from "@angular/forms";
import { DynamicForm } from "./dynamic.form";

@Component({
    selector: '[form-control]',
    template: `<ng-template #content></ng-template>`,
})
export abstract class DynamicFormControl extends DynamicForm {

    formControl = computed(() => this.abstractControl() as FormControl)

    getNewAbstractControl() {
        return new FormControl();
    }

    override initializeValue() {
        return this.field().defaultValue?.toString() || '';
    }
}