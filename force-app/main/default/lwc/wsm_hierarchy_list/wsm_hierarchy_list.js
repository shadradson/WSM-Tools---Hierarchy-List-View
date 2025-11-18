import { LightningElement, api } from 'lwc';

export default class Wsm_hierarchy_list extends LightningElement {
    @api incRecordCollection;
    @api relationshipField;
    @api fieldsToDisplay;
    @api incObjectAPIName;

    hierarchyData = [];
    settings = {};
    error;

    connectedCallback() {
        try {
            this.buildHierarchy();
        } catch (e) {
            this.error = `Error building hierarchy: ${e.message}`;
        }
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

        // Parse fields to display
        const fields = this.fieldsToDisplay.split(',').map(field => field.trim());
        
        // Create settings object
        this.settings = {
            objectApiName: this.incObjectAPIName,
            fields: fields,
            indentLevel: 0,
            canExpand: true,
            recordIdField: 'Id',
            relationshipField: this.relationshipField
        };

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