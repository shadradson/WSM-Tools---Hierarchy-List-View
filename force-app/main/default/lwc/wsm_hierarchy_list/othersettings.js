export function testsettings() {
    let settings = {
        hasColoredFields: false,
        hasColoredRecords: true,
        fieldSettings: [
            {
                field: 'Status__c',
                variant: 'label-hidden',
                mode: 'recordColor',
                _comment: 'There are 2 modes. fieldColor and recordColor. fieldColor changes the color of the field. recordColor changes the color of the record.',
                values: [
                    { value: "New", color: "blue" },
                    { value: "Working", color: "blue" },
                    { value: "Active", color: "aqua" },
                    { value: "Complete", color: "green" },
                    { value: "Cancelled", color: "red" },
                    { value: "Archived", color: "orange" }
                ]
            },
        ]
    };
    return JSON.stringify(settings);
}

/* field Variants
                "standard"
                "label-inline"
                "label-stacked"
                "label-hidden"

                */