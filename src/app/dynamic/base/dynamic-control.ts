import { Component, inject, ViewContainerRef, HostBinding, input } from "@angular/core";
import { FormField } from "../models/lift-tracker";
import { DynamicDataSourceControl } from "./dynamic.datasource.control";

@Component({
    selector: '[dynamic-control]',
    template: `<ng-template #content></ng-template>Hola`
})
export abstract class DynamicControl extends DynamicDataSourceControl {

    viewContainerRef = inject(ViewContainerRef);
    showLabel = input(true);

    @HostBinding('class')
    get classes() {
        return `field-group col-12 ${this.field().class ?? ''} ${this.field().hidden ? 'hidden' : ''}`
    };

    createComponent(containerRef: ViewContainerRef, field: FormField) {
        const component = this.dynamicConfigService.getComponent(field.type);
        const refComponent = containerRef.createComponent(component);
        refComponent.setInput('formGroup', this.formGroup());
        refComponent.setInput('field', field);

        return refComponent;
    }

    // private handleTriggers(field: FormField, value: any) {
    //     field.triggers?.forEach(trigger => {
    //         const conditionMet = evaluateCondition(trigger.condition, this.schema().fields, this.form());

    //         if (conditionMet) {
    //             if (trigger.action === 'setValue') {
    //                 this.formGroup().get(trigger.target)?.setValue(trigger.value, { emitEvent: false });
    //             }
    //         }
    //     });
    // }


}