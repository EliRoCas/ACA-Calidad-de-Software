import { Component, ViewEncapsulation } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { DynamicError } from "./dynamic-error";
import { DynamicFormControl } from "../base/dynamic.form.control";

@Component({
    selector: 'div[checkbox]',
    imports: [ReactiveFormsModule, DynamicError],
    styleUrl: '../base/control.scss',
    encapsulation: ViewEncapsulation.None,
    template: `
    @if (showLabel() && field().label) {
      <label [for]="field().id"> {{ field().label }} </label>
    }
        
    <div class="custom-input">
        @for (opt of field().options; track opt)
        {
        <label>
            <input type="radio" [formControl]="formControl()" [value]="opt.value.toString()" />
            {{ opt.label }}
        </label>
        }

        @for (opt of dataSource(); track opt)
        {
        <label>
            <input type="radio" [formControl]="formControl()" [value]="opt.value.toString()" />
            {{ opt.label }}
        </label>
        }
    </div>
    
    <dynamic-error [errors]="errors()" />
    `
})
export class DynamicRadio extends DynamicFormControl { }