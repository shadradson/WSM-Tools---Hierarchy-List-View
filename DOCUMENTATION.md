# WSM Hierarchy List Components

## Overview

The WSM Hierarchy List is a pair of Lightning Web Components that display Salesforce records in a hierarchical tree structure with customizable field display and styling options.

## Components

### 1. wsm_hierarchy_list (Parent Component)

The main component that receives data from a Salesforce Flow and builds the hierarchy structure.

#### Public Properties (Flow Inputs)

- **incRecordCollection** - Collection of records to display in the hierarchy
- **relationshipField** - API name of the lookup field that defines parent-child relationships (e.g., `Parent__c`)
- **fieldsToDisplay** - Comma-separated list of field API names to display (e.g., `Name,Status__c,Owner.Name`)
- **incObjectAPIName** - API name of the object being displayed (e.g., `Account`, `Custom_Object__c`)
- **titleField** - API name of the field to use as the record title
- **subTitleField** - API name of the field to use as the record subtitle (optional)
- **settingsJSON** - JSON string containing advanced display settings (see Settings JSON Format below)

#### Functionality

- Builds a hierarchical tree structure from flat record collection using parent-child relationships
- Passes configuration settings to child components
- Handles top-level records (records without parents)
- Validates required inputs and displays error messages

---

### 2. wsm_hierarchy_list_child (Child Component)

The recursive component that renders individual records and their children.

#### Features

- **Expandable/Collapsible** - Records with children can be expanded or collapsed
- **Click Navigation** - Click on any record to navigate to its detail page
- **Keyboard Accessible** - Supports keyboard navigation (Enter/Space to open, Arrow keys to expand/collapse)
- **Field Display** - Shows title, subtitle, and additional fields per configuration
- **Custom Styling** - Supports field-level and record-level color coding based on field values

---

## Settings JSON Format

The `settingsJSON` parameter accepts a JSON string with advanced configuration options. This JSON will be provided by the Salesforce Flow.

### Structure

```json
{
  "hasColoredFields": false,
  "hasColoredRecords": true,
  "fieldSettings": [
    {
      "field": "Status__c",
      "variant": "label-hidden",
      "mode": "recordColor",
      "values": [
        { "value": "New", "color": "blue" },
        { "value": "Working", "color": "blue" },
        { "value": "Active", "color": "aqua" },
        { "value": "Complete", "color": "green" },
        { "value": "Cancelled", "color": "red" },
        { "value": "Archived", "color": "orange" }
      ]
    }
  ]
}
```

### Properties

#### Top Level

- **hasColoredFields** (boolean) - Enable field-level color coding
- **hasColoredRecords** (boolean) - Enable record-level color coding
- **fieldSettings** (array) - Array of field-specific configuration objects

#### Field Settings Object

- **field** (string, required) - API name of the field (e.g., `Status__c`)
- **variant** (string, optional) - Display variant for the field:
  - `"standard"` - Default display with label
  - `"label-inline"` - Label displayed inline with value
  - `"label-stacked"` - Label displayed above value
  - `"label-hidden"` - Hide the label, show only value
- **mode** (string, optional) - Color application mode:
  - `"fieldColor"` - Apply color to the field background only
  - `"recordColor"` - Apply color to the entire record background
- **values** (array, optional) - Array of value-to-color mappings
  - **value** (string) - The field value to match
  - **color** (string) - CSS color name or hex code (e.g., `"blue"`, `"#FF5733"`)

---

## Usage Example

### Flow Configuration

1. Use Get Records element to retrieve your record collection
2. Add the `wsm_hierarchy_list` component to your Flow screen
3. Configure the component inputs:

```
incRecordCollection: {!RecordCollection}
relationshipField: Parent__c
fieldsToDisplay: Name,Status__c,Owner.Name,CreatedDate
incObjectAPIName: Project__c
titleField: Name
subTitleField: Description__c
settingsJSON: {!SettingsJSONVariable}
```

### Settings JSON Example (from Flow Formula)

```json
{
  "hasColoredFields": false,
  "hasColoredRecords": true,
  "fieldSettings": [
    {
      "field": "Status__c",
      "variant": "label-hidden",
      "mode": "recordColor",
      "values": [
        { "value": "New", "color": "#E3F2FD" },
        { "value": "In Progress", "color": "#FFF9C4" },
        { "value": "Completed", "color": "#C8E6C9" },
        { "value": "Cancelled", "color": "#FFCDD2" }
      ]
    }
  ]
}
```

---

## Behavior

### Hierarchy Building

The component uses a two-pass algorithm to build the hierarchy:
1. First pass: Creates a map of all records
2. Second pass: Establishes parent-child relationships based on the `relationshipField`
3. Records without parents become top-level items

### Expand/Collapse

- Records with children display an expand/collapse button
- Default state is expanded
- State is maintained independently for each record
- Keyboard accessible (Arrow Right to expand, Arrow Left to collapse)

### Color Coding

#### Record-Level Coloring
When `mode: "recordColor"` is set, the entire record card changes color based on field value matches.

#### Field-Level Coloring
When `mode: "fieldColor"` is set, only the specific field's background changes color based on value matches.

---

## Technical Notes

- The component is recursive - each child can render more children
- Indentation automatically increases at each level (managed via `indentLevel` setting)
- Navigation uses the Lightning Navigation Service
- All fields are displayed using `lightning-output-field` for proper formatting
- The component validates required inputs and displays error messages
- Console logging is included for debugging (can be removed in production)

---

## Requirements

- Lightning Web Components enabled
- Salesforce Flow (for data input)
- Read access to the object and fields being displayed
- Proper object relationships (lookup fields) for hierarchy