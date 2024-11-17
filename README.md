# Fuzzy Tables

A simple, flexible, and fast table component for React with built-in sorting, filtering, and customization options.

## Installation

```bash
npm install fuzzy-tables
# or
yarn add fuzzy-tables
```

## Basic Usage

This library is built around the concept of store-component factories. A function that returns a React component binded to a state store. This allows flexibility and easy access to the internal state of the table.

There are multiple ways to build a table:

### 1. From a list of fields

The simplest way to create a table is by providing an array of field names:

```tsx
const Table = buildTable(['name', 'email', 'status'])
```

### 2. From column definitions

For more control, you can define columns with custom headers and rendering:

```tsx
const Table = buildTable([
  {
    header: 'Name',
    field: 'name',
  },
  {
    header: 'Email',
    field: 'email',
    render: (row) => <a href={`mailto:${row.email}`}>{row.email}</a>
  },
  {
    header: 'Status',
    field: 'status',
    render: (row) => <StatusBadge status={row.status} />
  }
])
```

## Hooks

Fuzzy Tables provides several custom hooks for advanced table manipulation:

### useTableStore

Access and manipulate the table's internal state directly:

```tsx
const Table = buildTable(['name', 'email', 'status']);

function TableControls() {
  const { 
    rowSelection,      // Record of selected row IDs
    toggleRowSelection,// Function to toggle row selection
    setRowSelection,   // Function to set row selection
    sortingFields,     // Current sorting configuration
    toggleSortingField // Function to toggle field sorting
  } = Table.useTableStore();

  return (
    <div>
      <button onClick={() => toggleSortingField('name')}>
        Sort by Name
      </button>
      <div>Selected Rows: {Object.keys(rowSelection).length}</div>
    </div>
  );
}
```

### useSelected

Get the currently selected rows from your data:

```tsx
function SelectedRowsDisplay({ data }) {
  const selectedRows = Table.useSelected(data);
  
  return (
    <div>
      <h3>Selected Items ({selectedRows.length})</h3>
      <ul>
        {selectedRows.map(row => (
          <li key={row._id}>{row.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### useHandler

Register event handlers for custom table actions:

```tsx
const Table = buildTable(['name', 'email'], ['edit', 'delete']);

function TableWithActions({ data }) {
  // Register handler for edit action
  Table.useHandler('edit', (row) => {
    console.log('Editing row:', row);
    // Open edit modal, etc.
  });

  // Register handler for delete action
  Table.useHandler('delete', (row) => {
    console.log('Deleting row:', row);
    // Show confirmation dialog, etc.
  });

  return <Table data={data} />;
}
```

## Complete Example with Hooks

Here's a more complex example showing how to use all the hooks together:

```tsx
const UserTable = buildTable(['name', 'email', 'status'], ['edit', 'delete']);

function UserManagement() {
  const [users, setUsers] = useState([]);
  
  // Get selected rows
  const selectedUsers = UserTable.useSelected(users);
  
  // Register handlers
  UserTable.useHandler('edit', (user) => {
    // Handle edit
  });
  
  UserTable.useHandler('delete', (user) => {
    // Handle delete
  });
  
  // Access table store for custom controls
  const { sortingFields, toggleRowSelection } = UserTable.useTableStore();
  
  return (
    <div>
      <div className="controls">
        <button 
          disabled={selectedUsers.length === 0}
          onClick={() => console.log('Selected:', selectedUsers)}
        >
          Process Selected ({selectedUsers.length})
        </button>
      </div>
      
      <UserTable data={users} />
      
      <div className="info">
        Current Sort: {sortingFields.map(f => `${f.field} ${f.direction}`).join(', ')}
      </div>
    </div>
  );
}
```

## Full Example

```tsx
import { buildTable } from 'fuzzy-tables';

const UserTable = buildTable([
  {
    header: 'Name',
    field: 'name',
    sortable: true,
    width: '30%',
  },
  {
    header: 'Email',
    field: 'email',
    render: (row) => <a href={`mailto:${row.email}`}>{row.email}</a>,
  },
  {
    header: 'Status',
    field: 'status',
    render: (row) => <StatusBadge status={row.status} />,
    filterable: true,
    align: 'center',
  },
]);

function App() {
  return (
    <UserTable
      data={users}
      selectable
      pagination={{ pageSize: 10 }}
      onSelectionChange={handleSelection}
      className="shadow-lg"
    />
  );
}
```