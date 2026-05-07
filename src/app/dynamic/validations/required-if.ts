import { ValidatorFn, AbstractControl, ValidationErrors, FormGroup } from "@angular/forms";
import { evaluateCondition } from "../base/utils";
import { FormField, ValidationLift } from "../models/lift-tracker";

export function RequireIf(field: FormField, validation: ValidationLift, formGroup: FormGroup): ValidatorFn {
    return (globalControl: AbstractControl): ValidationErrors | null => {

        const currentControl = formGroup.get(field.id);

        if (evaluateCondition(validation.condition ?? 'true', formGroup.getRawValue(), globalControl)
            && (!currentControl?.value)) {

            return { "requiredIf": { id: field.id, message: validation.message } };
        }

        return null;
    };
}