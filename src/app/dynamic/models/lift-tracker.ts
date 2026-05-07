import { FormGroup, ValidatorFn } from "@angular/forms";
import { Type } from "@angular/core";
import { DynamicControl } from "../base/dynamic-control";

export interface FormField {
    id: string;
    label?: string;
    type: 'date' | 'table' | 'section-container' | 'text' | 'select' | 'number' | 'radio' | 'checkbox';
    defaultValue?: any;
    options?: { label: string; value: any }[];
    readonly?: boolean;
    class?: string;
    format?: string; //centi, fare, etc...
    dataSource?: {
        url: string;
        map: { label: string; value: string; root: string };
    };
    dependsOn?: string;
    triggers?: Array<{
        action: 'setValue';
        target: string;
        condition: string; // Example: "{{client_type}} === 'EP'"
        value?: any;
    }>;
    validations?: ValidationLift[];
    hidden?: boolean;
    order?: number;
    children?: FormField[]
}

export interface ValidationLift {
    type: 'required' | 'condition' | 'requiredIf' | 'range' | 'maxLength';
    condition?: string,
    message: string
    params?: any[];
}

export interface FormLift {
    fields: FormField[];
}

export interface ValidationDetail {
    id: string;
    message: string;
}

export interface DynamicEntry<T extends DynamicControl = DynamicControl> {
    name: string;
    component: Type<T>;
}

export type DynamicRegistry = DynamicEntry[];

export type DynamicValidationEntry = {
    name: string,
    value: (field: FormField, validation: ValidationLift, formGroup: FormGroup) => ValidatorFn,
    isGlobal?: boolean
};