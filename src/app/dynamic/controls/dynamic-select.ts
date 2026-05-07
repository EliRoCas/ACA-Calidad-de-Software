import { Component, ViewEncapsulation } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { DynamicError } from "./dynamic-error";
import { DynamicFormControl } from "../base/dynamic.form.control";

@Component({
    selector: 'div[select]',
    imports: [ReactiveFormsModule, DynamicError],
    styleUrl: '../base/control.scss',
    encapsulation: ViewEncapsulation.None,
    template: `
        @if (showLabel() && field().label) {
        <label [for]="field().id"> {{ field().label }} </label>
        }
        
        <select [id]="field().id" [formControl]="formControl()">
           <option value=""></option>

            @for (opt of field().options; track opt)
            {
            <option [value]="opt.value">{{opt.label}}</option>
            }

            @for (opt of dataSource(); track opt)
            {
            <option [value]="opt.value">{{opt.label}}</option>
            }
        </select>
        
        <dynamic-error [errors]="errors()" />
`
})
export class DynamicSelect extends DynamicFormControl { }