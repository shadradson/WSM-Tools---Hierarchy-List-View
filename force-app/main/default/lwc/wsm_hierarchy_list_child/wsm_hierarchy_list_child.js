import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class Wsm_hierarchy_list_child extends NavigationMixin(LightningElement) {
    @api incRecord;
    @api incSettings;

    isExpanded = true;

    title = '';
    subTitle = '';
    otherFieldsCompiled = [];
    isRecordColorBasedOnField = false;
    isFieldColorBasedOnField = false;
    recordColorBasedOnField = null;

    connectedCallback() {
        this.title = this.getFieldValue(this.incSettings.titleField);
        if (this.incSettings.hasSubtitle) {
            this.subTitle = this.getFieldValue(this.incSettings.subTitleField);
        }
        // apply other settings field settings to the fields
        this.incSettings.otherFields.forEach(field => {
            let fieldValueOnRecord = this.getFieldValue(field);
            fieldValueOnRecord? fieldValueOnRecord = fieldValueOnRecord : fieldValueOnRecord = '-';

            let fieldCompiled = {
                fieldAPIName: field,
                hasFieldSettings: false,
                variant: 'standard',
                fieldRecordValue: null,
                value: fieldValueOnRecord
            }
            let singleFieldSetting = this.incSettings.otherSettings.fieldSettings.find(fieldSetting =>fieldSetting.field === field);
            //console.log('Found setting for field: ',JSON.stringify(singleFieldSetting));
            // check that the fieldsettings was found
            if (singleFieldSetting && singleFieldSetting !== undefined) {
                fieldCompiled.hasFieldSettings = true;
                // Check variant
                if (singleFieldSetting.variant !== undefined) {
                    fieldCompiled.variant = singleFieldSetting.variant;
                }
            }
            // check if a field value was found
            if (fieldValueOnRecord !== undefined &&  fieldValueOnRecord !== '') {
                fieldCompiled.fieldRecordValue = fieldValueOnRecord;
                // check if a value matches a value set in the field settings
                if (singleFieldSetting.values !== undefined) {
                    let valueMatch = singleFieldSetting.values.find(value => value.value === fieldValueOnRecord);
                    //console.log('Match between value of record and value in settings?: \nField Setting', JSON.stringify(singleFieldSetting.values), '\nField value on record', fieldValueOnRecord);
                    if (valueMatch !== undefined) {
                        console.log('Value Match Found: ',JSON.stringify(valueMatch));
                        // check the value mode
                        if (singleFieldSetting.mode == 'fieldColor') {
                            fieldCompiled.datacolor = valueMatch.color;
                            this.isFieldColorBasedOnField = true;
                        }
                        if (singleFieldSetting.mode == 'recordColor') {
                            this.recordColorBasedOnField = valueMatch.color;
                            this.isRecordColorBasedOnField = true;
                        }
                    }
                }
            }
            //console.log('Found Field settings: ', JSON.stringify(singleFieldSetting));
            //console.log('Output of the compiled field with settings: ', JSON.stringify(fieldCompiled));


            // push to compiled fields.
            this.otherFieldsCompiled.push(fieldCompiled);
        });
        console.log('Total Fields: ',JSON.stringify(this.otherFieldsCompiled));
    }

    renderedCallback() {
        if (this.incSettings.otherSettings.hasColoredFields && this.isFieldColorBasedOnField) { this.fieldColors(); };
        if (this.incSettings.otherSettings.hasColoredRecords && this.isRecordColorBasedOnField) { this.recordColors(); };
    }

    fieldColors() {
        // gets all fields that should have colors and changes them to the values.
        let fieldsWithColor = this.template.querySelectorAll('[data-fieldcolor]');
        console.log('Fields found to change color: ',JSON.stringify(fieldsWithColor));
        fieldsWithColor.forEach(field => {
            field.style.backgroundColor = field.dataset.fieldcolor;
        });
    }

    recordColors() {
        // gets all fields that should have colors and changes them to the values.
        let recordsWithColor = this.template.querySelectorAll('[data-recordcolor]');
        console.log('Record found to change color: ',JSON.stringify(recordsWithColor));
        recordsWithColor.forEach(record => {
            record.style.backgroundColor = record.dataset.recordcolor;
        });
    }

    get hasChildren() {
        return this.incRecord?.children?.length > 0;
    }

    get expandIcon() {
        return this.isExpanded ? 'utility:chevrondown' : 'utility:chevronright';
    }

    get toggleButtonLabel() {
        return this.isExpanded ? 'Collapse' : 'Expand';
    }

    get childSettings() {
        return {
            ...this.incSettings,
            indentLevel: (this.incSettings?.indentLevel || 0) + 1
        };
    }

    get ariaLabel() {
        const fields = this.incSettings?.otherFields || [];
        const recordName = fields.length > 0 ? this.incRecord[fields[0]] : 'Record';
        return `${recordName} - ${this.hasChildren ? 'Has children' : 'No children'}`;
    }

    get ariaExpanded() {
        return this.hasChildren ? String(this.isExpanded) : null;
    }

    get displayFields() {
        console.log('Get Display Fields: ', JSON.stringify(this.incSettings.otherFields));
        return this.incSettings?.otherFields || [];
    }

    handleRecordClick(event) {
        event.stopPropagation();
        console.log('Navigate to record: ', this.incRecord.Id);
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.incRecord.Id,
                actionName: 'view'
            }
        });
    }

    handleToggleExpand(event) {
        event.stopPropagation();
        this.isExpanded = !this.isExpanded;
    }

    handleKeyDown(event) {
        // Enter or Space to navigate to record
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.handleRecordClick(event);
        }
        // Arrow right to expand
        if (event.key === 'ArrowRight' && this.hasChildren && !this.isExpanded) {
            event.preventDefault();
            this.isExpanded = true;
        }
        // Arrow left to collapse
        if (event.key === 'ArrowLeft' && this.hasChildren && this.isExpanded) {
            event.preventDefault();
            this.isExpanded = false;
        }
    }

    @api
    receiveSettings(settings) {
        this.incSettings = {
            ...incSettings,
            indentLevel: (settings?.indentLevel || 0) + 1
        };
        // Cascade to children
        this.notifyChildren();
    }

    notifyChildren() {
        if (this.hasChildren) {
            const children = this.template.querySelectorAll('c-wsm_hierarchy_list_child');
            children.forEach(child => child.receiveSettings(this.incSettings));
        }
    }

    getFieldValue(fieldName) {
        return this.incRecord?.[fieldName] || '';
    }
}