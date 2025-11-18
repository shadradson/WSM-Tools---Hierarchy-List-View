import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class Wsm_hierarchy_list_child extends NavigationMixin(LightningElement) {
    @api incRecord;
    @api incSettings;

    isExpanded = true;

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
        const fields = this.incSettings?.fields || [];
        const recordName = fields.length > 0 ? this.incRecord[fields[0]] : 'Record';
        return `${recordName} - ${this.hasChildren ? 'Has children' : 'No children'}`;
    }

    get ariaExpanded() {
        return this.hasChildren ? String(this.isExpanded) : null;
    }

    get displayFields() {
        return this.incSettings?.fields || [];
    }

    handleRecordClick(event) {
        event.stopPropagation();
        
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
            ...settings, 
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