import { APP_INITIALIZER } from "@angular/core";
import { DynamicSectionContainer } from "../controls/dynamic-section-container";
import { DynamicCheckbox } from "../controls/dynamic-checkbox";
import { DynamicDatepicker } from "../controls/dynamic-datepicker";
import { DynamicNumber } from "../controls/dynamic-number";
import { DynamicRadio } from "../controls/dynamic-radio";
import { DynamicSelect } from "../controls/dynamic-select";
import { DynamicTable } from "../controls/dynamic-table";
import { DynamicText } from "../controls/dynamic-text";
import { Condition } from "../validations/condition";
import { MaxLength } from "../validations/max-length";
import { Required } from "../validations/required";
import { RequireIf } from "../validations/required-if";
import { Range } from "../validations/range";
import { DynamicConfigService } from "./dynamic.config.service";

export function provideDynamicForms() {
    return {
        provide: APP_INITIALIZER,
        useFactory: (dynamicConfigService: DynamicConfigService) => () => {
            dynamicConfigService.CONTROL_LIST = [
                { name: 'text', component: DynamicText },
                { name: 'number', component: DynamicNumber },
                { name: 'select', component: DynamicSelect },
                { name: 'radio', component: DynamicRadio },
                { name: 'checkbox', component: DynamicCheckbox },
                { name: 'date', component: DynamicDatepicker },
                { name: 'table', component: DynamicTable },
                { name: 'section-container', component: DynamicSectionContainer },
            ];

            dynamicConfigService.VALIDATIONS = [
                { name: 'required', value: Required },
                { name: 'condition', value: Condition, isGlobal: true },
                { name: 'range', value: Range },
                { name: 'requiredIf', value: RequireIf, isGlobal: true },
                { name: 'maxLength', value: MaxLength },
            ];
        },
        deps: [DynamicConfigService],
        multi: true
    };
}