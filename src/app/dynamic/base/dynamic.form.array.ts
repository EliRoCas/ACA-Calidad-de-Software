import { Component, computed } from "@angular/core";
import { FormArray, FormGroup } from "@angular/forms";
import { DynamicForm } from "./dynamic.form";

@Component({
    selector: '[form-array]',
    template: `<ng-template #content></ng-template>`,
})
export abstract class DynamicFormArrayControl extends DynamicForm {

    getNewAbstractControl() {
        const array = new FormArray<any>([]);
        this.formGroups().forEach(g => array.push(g));
        this.abstractControl.set(array);

        return array;
    }

    override initializeValue() {
        //Value not initialized due it depends on dynamic defaultValue and children
    }

    defaultValues = computed<any[]>(() => {
        if (this.field().defaultValue && !Array.isArray(this.field().defaultValue)) {
            throw new Error('defaultValue should be an array for tables');
        }

        return Array.isArray(this.field().defaultValue) ? this.field().defaultValue : [];
    });

    formGroups = computed(() => {
        return Array
            .from({ length: this.defaultValues().length })
            ?.map((_: any) => new FormGroup<any>({}))
    })

    childWithDefaultValue = computed(() => {
        if (!this.children() || this.children()?.length === 0) {
            throw new Error(`DynamicTable ${this.field().id} should must have children items`);
        }

        return this.defaultValues().map(value => {
            let obj: any = {};

            this.children().forEach(child => {
                obj[child.id] = { ...child, defaultValue: value[child.id] }
            });

            return obj;
        })

    });
}