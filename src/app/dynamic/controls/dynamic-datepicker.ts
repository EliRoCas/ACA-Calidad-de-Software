import { Component, ViewEncapsulation } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { DynamicError } from "./dynamic-error";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { provideNativeDateAdapter } from "@angular/material/core";
import { DynamicFormControl } from "../base/dynamic.form.control";

@Component({
    selector: 'div[datepicker]',
    imports: [ReactiveFormsModule, DynamicError, MatDatepickerModule],
    styleUrl: '../base/control.scss',
    encapsulation: ViewEncapsulation.None,
    providers: [provideNativeDateAdapter()],
    template: `
    @if (showLabel() && field().label) {
      <label [for]="field().id"> {{ field().label }} </label>
    }
        
    <div class="custom-input">
        <input [matDatepicker]="picker" [id]="field().id" [formControl]="formControl()">
        <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
    </div>

    <dynamic-error [errors]="errors()" />
    `
})
export class DynamicDatepicker extends DynamicFormControl { }