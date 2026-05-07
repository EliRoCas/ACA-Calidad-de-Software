import { ValidatorFn, AbstractControl, ValidationErrors, FormGroup } from "@angular/forms";
import { FormField, ValidationLift } from "../models/lift-tracker";

export function Required(field: FormField, validation: ValidationLift, formGroup: FormGroup): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) {
            return { "required": { id: field.id, message: validation.message } };
        }

        return null;
    };
}
