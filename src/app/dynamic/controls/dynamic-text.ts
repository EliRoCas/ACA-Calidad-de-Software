import { Component, ViewEncapsulation } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { DynamicError } from "./dynamic-error";
import { DynamicFormControl } from "../base/dynamic.form.control";

@Component({
  selector: 'div[text]',
  imports: [ReactiveFormsModule, DynamicError],
  styleUrl: '../base/control.scss',
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (showLabel() && field().label) {
      <label [for]="field().id"> {{ field().label }} </label>
    }

    <div class="custom-input">
        <input type="text" [id]="field().id" [formControl]="formControl()" />

        @if(field().format)
        {
        <span class="end">
            {{ field().format }}
        </span>
        }
    </div>

    <dynamic-error [errors]="errors()" />`
})
export class DynamicText extends DynamicFormControl { }