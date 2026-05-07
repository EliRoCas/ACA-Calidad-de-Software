import { ValidatorFn, AbstractControl, ValidationErrors, FormGroup } from "@angular/forms";
import { evaluateCondition } from "../base/utils";
import { FormField, ValidationLift } from "../models/lift-tracker";

export function Condition(field: FormField, validation: ValidationLift, formGroup: FormGroup): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!evaluateCondition(validation.condition ?? 'true', formGroup.getRawValue(), control)) {
            return { "condition": { id: field.id, message: validation.message } };
        }

        return null;
    };
}