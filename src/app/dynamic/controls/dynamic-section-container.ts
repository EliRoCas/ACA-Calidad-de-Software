import { Component, effect, HostBinding, viewChild, ViewContainerRef, ViewEncapsulation } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { DynamicControl } from "../base/dynamic-control";

@Component({
    selector: '[dynamic-section]',
    imports: [ReactiveFormsModule],
    styleUrl: '../base/control.scss',
    encapsulation: ViewEncapsulation.None,
    template: `
        @if (field().label) {
            <h2 class="col-12">{{ field().label }}</h2>
        }

        <ng-template #content></ng-template>`,
})
export class DynamicSectionContainer extends DynamicControl {

    containerRef = viewChild.required('content', { read: ViewContainerRef });

    @HostBinding('class')
    override get classes() {
        return `dynamic-container col-12 ${this.field().class ?? ''}`
    };

    constructor() {
        super();

        effect(() => {
            this.containerRef().clear();

            let children = this.field().children ?? [];
            children.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            children.forEach(child => this.createComponent(this.containerRef(), child));
        })
    }
}