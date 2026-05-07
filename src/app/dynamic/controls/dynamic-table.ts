import { Component, computed, effect, viewChild, ViewContainerRef, ViewEncapsulation } from "@angular/core";
import { DynamicControl } from "../base/dynamic-control";
import { MatTableModule } from '@angular/material/table';
import { DynamicFormArrayControl } from "../base/dynamic.form.array";

@Component({
    selector: '[cell-content]',
    template: `<ng-template #content></ng-template>`
})
export class DynamicTableDefinition extends DynamicControl {

    containerRef = viewChild.required('content', { read: ViewContainerRef });

    constructor() {
        super();

        effect(() => {
            const componentRef = this.createComponent(this.containerRef(), this.field());
            componentRef.setInput("showLabel", false);
        });
    }
}

@Component({
    selector: 'div[table]',
    imports: [MatTableModule, DynamicTableDefinition],
    styleUrl: '../base/control.scss',
    encapsulation: ViewEncapsulation.None,
    template: `
        @if (showLabel() && field().label) {
        <label [for]="field().id"> {{ field().label }} </label>
        }

        <table mat-table [dataSource]="defaultValues()" >

            @for(child of children(); track child.id) {
                <ng-container [matColumnDef]="child.id">
                    <th mat-header-cell *matHeaderCellDef>
                        <strong> {{ child.label }} </strong> 
                    </th>
                    <td mat-cell *matCellDef="let element; let i = index">
                         <div cell-content 
                            [field]="childWithDefaultValue()[i][child.id]"
                            [formGroup]="formGroups()[i]">
                        </div>
                    </td>
                </ng-container>
            }

            <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns();"></tr>

        </table>`
})
export class DynamicTable extends DynamicFormArrayControl {
    displayedColumns = computed(() => this.children().filter(c => !c.hidden).map(c => c.id));
}