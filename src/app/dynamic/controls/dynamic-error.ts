import { Component, ViewEncapsulation, input } from "@angular/core";

@Component({
    selector: 'dynamic-error',
    styleUrl: '../base/control.scss',
    encapsulation: ViewEncapsulation.None,
    template: `
        @if (errors().length > 0)
        {
        <ul class="dynamic-error">
            @for(error of errors(); track error)
            {
            <li>{{ error.detail.message }}</li>
            }
        </ul>
        }`
})
export class DynamicError {
    errors = input.required<any[]>();
}
