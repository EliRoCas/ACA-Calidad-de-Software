import { Component, ViewEncapsulation } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { DynamicError } from "./dynamic-error";
import { DynamicFormControl } from "../base/dynamic.form.control";

@Component({
    selector: 'div[number]',
    imports: [ReactiveFormsModule, DynamicError],
    styleUrl: '../base/control.scss',
    encapsulation: ViewEncapsulation.None,
    template: `
    @if (showLabel() && field().label) {
      <label [for]="field().id"> {{ field().label }} </label>
    }

    <div class="custom-input">
        <span class="start material-symbols-outlined">
            pin
        </span>
        
        <input type="number" [id]="field().id" [formControl]="formControl()" />

        @if(field().format)
        {

        <span class="end">
            {{ field().format }}
        </span>
        
        }
    </div>

    <dynamic-error [errors]="errors()" />
    `
})
export class DynamicNumber extends DynamicFormControl {

    override initializeValue() {
        if (this.field().defaultValue && !isNaN(this.field().defaultValue))
            return Number(this.field().defaultValue);

        return undefined;
    }
}