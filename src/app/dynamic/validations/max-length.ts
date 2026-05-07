import { ValidatorFn, AbstractControl, ValidationErrors, FormGroup } from "@angular/forms";
import { FormField, ValidationLift } from "../models/lift-tracker";

export function MaxLength(field: FormField, validation: ValidationLift, formGroup: FormGroup): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

        if ((validation.params?.length ?? 0) > 1) {
            throw new Error('MaxLenght validation should be configured');
        }

        if ((control.value ?? '').length > validation.params![0]
        ) {
            return { "maxLength": { id: field.id, message: validation.message } };
        }

        return null;
    };
}