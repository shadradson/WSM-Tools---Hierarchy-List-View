import { LightningElement, api } from 'lwc';

export default class Wsm_hierarchy_list extends LightningElement {
    @api incRecordCollection;
    @api relationshipField;
    @api fieldsToDisplay;
    @api incObjectAPIName;
    @api titleField;
    @api subTitleField;
    @api settingsJSON;

    hierarchyData = [];
    settings = {};
    error;

    paddingType = 'comfy';
    isDarkMode = false;

    connectedCallback() {
        try {
            //let parseTest = JSON.parse(this.settingsJSON);
            //console.log('Parsing JSON: ',JSON.stringify(parseTest));
            console.log('Settings JSON: ',this.settingsJSON);
            this.buildHierarchy();
            this.initSettings();
        } catch (e) {
            this.error = `Error building hierarchy: ${e.message}`;
        }
    }

    renderedCallback() {
        this.darkModeAndPaddingApply();
    }

    darkModeAndPaddingApply() {
        let darkMode = this.template.querySelectorAll('[data-darkmode]');
        let paddingType = this.template.querySelectorAll('[data-paddingtype]');
        if (darkMode && this.settings.otherSettings.darkMode) {
            darkMode.forEach(element => {
                element.classList.add('darkmode');
            });
        }
        if (paddingType) {
            paddingType.forEach(element => {
                element.classList.add(element.dataset.paddingtype);
            });
        }
    }

    initSettings() {
        // Create settings object
        // check that subtitle was added.
        const hasSubtitle = this.subTitleField && this.subTitleField !== '';
        
        this.settings = {
            objectApiName: this.incObjectAPIName,
            titleField: this.titleField,
            hasSubtitle: hasSubtitle,
            subTitleField: this.subTitleField,
            otherFields: this.fieldsToDisplay.split(',').map(field => field.trim()),
            indentLevel: 0,
            canExpand: true,
            relationshipField: this.relationshipField,
            hasOtherSettings: false
        };
        if (this.settingsJSON && this.settingsJSON !== '') {
            this.settings.otherSettings = JSON.parse(this.settingsJSON);
            this.settings.hasOtherSettings = true;
            // set padding type and dark mode modifiers
            if (this.settings.otherSettings.darkMode !== undefined && this.settings.otherSettings.darkMode !== null) {this.isDarkMode = this.settings.otherSettings.darkMode;}
            if (this.settings.otherSettings.paddingType !== undefined && this.settings.otherSettings.paddingType !== null) {this.paddingType = this.settings.otherSettings.paddingType;}
        }
        console.log('Seetings Parsed: ',JSON.stringify(this.settings));
    }

    buildHierarchy() {
        if (!this.incRecordCollection || this.incRecordCollection.length === 0) {
            this.error = 'No records provided';
            return;
        }
        if (!this.relationshipField) {
            this.error = 'Relationship field is required';
            return;
        }
        if (!this.fieldsToDisplay) {
            this.error = 'Fields to display are required';
            return;
        }

        // Build hierarchy using two-pass algorithm
        const recordMap = new Map();
        const topLevel = [];

        // First pass: Create map and initialize children arrays
        this.incRecordCollection.forEach(record => {
            recordMap.set(record.Id, { ...record, children: [] });
        });

        // Second pass: Build parent-child relationships
        this.incRecordCollection.forEach(record => {
            const parentId = record[this.relationshipField];
            if (parentId && recordMap.has(parentId)) {
                // Has parent - add to parent's children
                recordMap.get(parentId).children.push(recordMap.get(record.Id));
            } else {
                // No parent - top level item
                topLevel.push(recordMap.get(record.Id));
            }
        });

        console.log('API Name of relationship field: ',JSON.stringify(this.relationshipField));
        console.log('Records Mapped: ',JSON.stringify(recordMap));

        this.hierarchyData = topLevel;
    }

    @api
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        // Notify all child components
        this.notifyChildren();
    }

    notifyChildren() {
        const children = this.template.querySelectorAll('c-wsm-hierarchy-list-child');
        children.forEach(child => child.receiveSettings(this.settings));
    }
}