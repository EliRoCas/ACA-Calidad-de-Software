import { HttpClient } from "@angular/common/http";
import { Component, signal, inject, effect } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { FormField } from "../models/lift-tracker";
import { BaseControl } from "./dynamic.base.control";

@Component({
    selector: '[dynamic-datasource-control]',
    template: `<ng-template #content></ng-template>Hola`,
})
export abstract class DynamicDataSourceControl extends BaseControl {

    dataSource = signal<{ label: string, value: string }[]>([]);
    http = inject(HttpClient);

    constructor() {
        super();

        effect(() => {
            if (this.field().dataSource && !this.field().dependsOn) {
                this.loadDataSource(this.field());
            }
        });

    }

    // private async handleCascades(parentId: string) {
    //     const children = this.schema().fields.filter(field => field.dependsOn === parentId);

    //     children.forEach(child => {
    //         this.formGroup().get(child.id)?.setValue('');
    //         this.loadDataSource(child);
    //     });
    // }

    private async loadDataSource(field: FormField) {
        const dataSource = field.dataSource!;
        let url = dataSource.url;

        // if (field.dependsOn) {
        //     const parentValue = this.formGroup().get(field.dependsOn)?.value;
        //     if (!parentValue) return;
        //     url = url.replace(`{{${field.dependsOn}}}`, parentValue);
        // }

        const response: any = await firstValueFrom(this.http.get(url));
        const rootData = dataSource.map.root ? dataSource.map.root.split('.').reduce((o, i) => o[i], response) : response;

        const data = rootData.map((item: any) => ({
            label: this.resolvePath(item, dataSource.map.label),
            value: this.resolvePath(item, dataSource.map.value)
        }));

        this.dataSource.set(data);
    }

    private resolvePath(obj: any, path: string) {
        return path.split('.').reduce((prev, curr) => prev?.[curr], obj);
    }
}