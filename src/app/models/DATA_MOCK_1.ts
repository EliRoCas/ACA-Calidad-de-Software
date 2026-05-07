import { FormLift } from "../dynamic/models/lift-tracker";

export const DATA_MOCK: FormLift = {
    "fields": [
        {
            "id": "id",
            "label": "",
            "type": "text",
            "defaultValue": crypto.randomUUID(),
            "hidden": true
        },
        {
            "id": "customer_type",
            "label": "Customer Type",
            "type": "select",
            "defaultValue": "PN",
            "order": 1,
            "options": [
                { "label": "Individual", "value": "PN" },
                { "label": "Company", "value": "EP" }
            ],
            "triggers": [
                {
                    "action": "setValue",
                    "target": "credit_limit",
                    "value": 5000,
                    "condition": "{{customer_type}} === 'PN'"
                }
            ],
            "validations": [
                {
                    "type": "required",
                    "message": "Loan Amount is required"
                }
            ]
        },
        {
            "id": "country_origin",
            "label": "Country",
            "type": "select",
            "order": 2,
            "defaultValue": "",
            "class": "col-6",
            "dataSource": {
                "url": "/countries.json",
                "map": {
                    "value": "cca2",
                    "label": "name.common",
                    "root": ""
                }
            }
        },
        {
            "id": "city_origin",
            "label": "City",
            "type": "select",
            "order": 3,
            "class": "col-6",
            "dependsOn": "country_origin",
            "dataSource": {
                "url": "/cities.json?iso={{country_origin}}",
                "map": {
                    "value": "city_id",
                    "label": "city_name",
                    "root": "data.items"
                }
            }
        },
        {
            "id": "loan_amount",
            "label": "Requested Loan Amount",
            "type": "number",
            "order": 5,
            "validations": [
                {
                    "type": "condition",
                    "condition": "Number( {{loan_amount}} ) <= Number( {{credit_limit}} )",
                    "message": "The amount cannot exceed your credit limit"
                },
                {
                    "type": "required",
                    "message": "Loan Amount is required"
                }
            ]
        },
        {
            "id": "credit_limit",
            "label": "Assigned Credit Limit",
            "type": "number",
            "readonly": true,
            "order": 4,
            "defaultValue": 0,
            "validations": [
                {
                    "type": "requiredIf",
                    "condition": "{{customer_type}} === 'EP'",
                    "message": "Credit limit is required when Company is selected"
                }
            ]
        },
        {
            "id": "emails",
            "label": "Allow receive emails?",
            "type": "checkbox",
            "defaultValue": "",
            "order": 10,
            "options": [
                { "label": "Emails", "value": "email" }
            ]
        },
        {
            "id": "advertising",
            "label": "Allow receive advertising?",
            "type": "checkbox",
            "defaultValue": "",
            "order": 10,
            "options": [
                { "label": "Emails", "value": "email" }
            ]
        },
        {
            "id": "preferred_method",
            "label": "Preferred method",
            "type": "radio",
            "defaultValue": "",
            "order": 11,
            "options": [
                { "label": "Effective", "value": "EF" },
                { "label": "Credit card", "value": "CC" }
            ]
        }
    ]
}
