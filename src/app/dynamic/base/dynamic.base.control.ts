import { Component, input, computed, inject } from "@angular/core";
import { DynamicConfigService } from "./dynamic.config.service";
import { FormField } from "../models/lift-tracker";
import { FormGroup } from "@angular/forms";

@Component({
    selector: '[base-control]',
    template: `<ng-template #content></ng-template>Hola`,
})
export abstract class BaseControl {
    formGroup = input.required<FormGroup>();
    field = input.required<FormField>();
    children = computed(() => this.field().children ?? []);
    isCollection = computed(() => this.field().type === 'table');
    dynamicConfigService = inject(DynamicConfigService);
}