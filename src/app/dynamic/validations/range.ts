import { ValidatorFn, AbstractControl, ValidationErrors, FormGroup } from "@angular/forms";
import { FormField, ValidationLift } from "../models/lift-tracker";

export function Range(field: FormField, validation: ValidationLift, formGroup: FormGroup): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

        if ((validation.params?.length ?? 0) < 2) {
            throw new Error('Range validation should have min and max params configured');
        }

        if (control.value
            && !(Number(control.value) >= validation.params![0]
                && Number(control.value) <= validation.params![1])
        ) {
            return { "range": { id: field.id, message: validation.message } };
        }

        return null;
    };
}