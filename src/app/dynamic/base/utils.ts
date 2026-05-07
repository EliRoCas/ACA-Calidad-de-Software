import { AbstractControl } from "@angular/forms";

export const evaluateCondition = (condition: string, allValues: object, form: AbstractControl): boolean => {
    let evalStr = condition;
    Object.entries(allValues).forEach((value => {
        const val = JSON.stringify(value[1]);
        evalStr = evalStr.replace(new RegExp(`{{${value[0]}}}`, 'g'), val);
    }));
    try { return eval(evalStr); } catch { return false; }
}
