const SCHEMA = {
    "id": "VSD0",
    "label": "Section container",
    "type": "section-container",
    "hidden": false,
    "children": [
        {
            "id": "birthday",
            "label": "Birthday",
            "type": "date",
            "validations": [
                {
                    "type": "required",
                    "message": "Date is required"
                }
            ]
        },
        {
            "id": "VSD7",
            "label": "Surface Control Type (VSD)",
            "type": "text",
            "readonly": false,
            "defaultValue": false,
            "validations": [
                {
                    "type": "required",
                    "message": "field is required"
                },
                {
                    "type": "condition",
                    "condition": "6 > 7",
                    "message": "6 > 6"
                }
            ]
        },
        {
            "id": "VSD3",
            "label": "Surface Number",
            "type": "number",
            "defaultValue": 0,
            "readonly": false
        },
        {
            "id": "SWB",
            "label": "Surface Control Type (SWB)",
            "type": "radio",
            "defaultValue": false,
            "options": [
                {
                    "value": true,
                    "label": "Yes"
                },
                {
                    "value": false,
                    "label": "No"
                }
            ],
            "readonly": false
        },
        {
            "id": "Running_Frequency",
            "label": "Running Frequency",
            "type": "number",
            "class": "col-4",
            "defaultValue": 10001,
            "validations": [
                {
                    "type": "required",
                    "message": "new required field"
                },
                {
                    "type": "range",
                    "message": "Running Frequency must be between 0.00 and 10000.00",
                    "params": [
                        0,
                        10000
                    ]
                }
            ],
            "readonly": false
        },
        {
            "id": "VSD_Base_Frequency",
            "label": "VSD Base Frequency",
            "type": "number",
            "defaultValue": 0,
            "class": "col-4",
            "validations": [
                {
                    "type": "range",
                    "message": "Running Frequency must be between 0.00 and 10000.00",
                    "params": [
                        0,
                        10000
                    ]
                }
            ],
            "readonly": false
        },
        {
            "id": "VSD_Motor_Direction",
            "label": "VSD Motor Direction",
            "type": "select",
            "class": "col-4",
            "defaultValue": 2,
            "options": [
                {
                    "value": 1,
                    "label": "Option 1"
                },
                {
                    "value": 2,
                    "label": "Option 2"
                },
                {
                    "value": 3,
                    "label": "Option 3"
                }
            ],
            "readonly": false
        },
        {
            "id": "Motor_Controller_Description",
            "label": "Motor Controller Description",
            "type": "text",
            "order": -1,
            "format": "°C",
            "validations": [
                {
                    "type": "required",
                    "message": "Motor Controller Description is required"
                },
                {
                    "type": "maxLength",
                    "message": "Max length is 5",
                    "params": [
                        5
                    ]
                }
            ],
            "readonly": false
        },
        {
            "id": "additional_info",
            "label": "Additional info",
            "type": "section-container",
            "children": [
                {
                    "id": "additional_info_left",
                    "type": "section-container",
                    "class": "col-12 col-md-6 border-red",
                    "children": [
                        {
                            "id": "additional_info_uuid",
                            "label": "Id",
                            "type": "text",
                            "defaultValue": "0b806809-ae0f-4758-ae03-2c7491fcf8e6"
                        },
                        {
                            "id": "customer_type",
                            "label": "Customer Type",
                            "type": "select",
                            "defaultValue": "EP",
                            "order": 1,
                            "options": [
                                {
                                    "label": "Individual",
                                    "value": "PN"
                                },
                                {
                                    "label": "Company",
                                    "value": "EP"
                                }
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
                                    "message": "Customer type"
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
                                "url": "/MOCK/countries.json",
                                "map": {
                                    "value": "cca2",
                                    "label": "name.common"
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
                                "url": "/MOCK/cities.json?iso={{country_origin}}",
                                "root": "data.items",
                                "map": {
                                    "value": "city_id",
                                    "label": "city_name"
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
                        }
                    ]
                },
                {
                    "id": "additional_info_right",
                    "type": "section-container",
                    "class": "col-12 col-md-6 border-red",
                    "children": [
                        {
                            "id": "credit_limit",
                            "label": "Assigned Credit Limit",
                            "type": "number",
                            "order": 40,
                            "defaultValue": 100,
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
                            "defaultValue": false,
                            "order": 10
                        },
                        {
                            "id": "advertising",
                            "label": "Allow receive advertising?",
                            "type": "checkbox",
                            "defaultValue": "",
                            "order": 10
                        },
                        {
                            "id": "preferred_method",
                            "label": "Preferred method",
                            "type": "radio",
                            "defaultValue": "EF",
                            "order": 11,
                            "options": [
                                {
                                    "label": "Effective",
                                    "value": "EF"
                                },
                                {
                                    "label": "Credit card",
                                    "value": "CC"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}
