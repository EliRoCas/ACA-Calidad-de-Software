import { Injectable } from "@angular/core";
import { DynamicRegistry, DynamicValidationEntry } from "../models/lift-tracker";

@Injectable({
    providedIn: 'root'
})
export class DynamicConfigService {
    CONTROL_LIST: DynamicRegistry = [];
    VALIDATIONS: DynamicValidationEntry[] = [];

    getComponent(type: string) {
        const entry = this.CONTROL_LIST.find(c => c.name === type);
        const component = entry?.component;

        if (!component) {
            throw new Error(`'${type}' not found in DynamicConfigService.CONTROL_LIST controls.`)
        }

        return component;
    }

    getValidation(type: string) {
        let val = this.VALIDATIONS
            .find(v => v.name === type);

        if (!val) {
            throw new Error(`Validation '${type}' doesnt exists`);
        }

        return val;
    }
}