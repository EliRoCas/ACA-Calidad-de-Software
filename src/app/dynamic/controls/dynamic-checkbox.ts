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
        <input type="checkbox" [id]="field().id" [formControl]="formControl()">
    </div>

    <dynamic-error [errors]="errors()" />
  `
})
export class DynamicCheckbox extends DynamicFormControl {

  override initializeValue() {
    if (typeof this.field().defaultValue === "boolean")
      return Boolean(this.field().defaultValue);

    return false;
  }
}