# Fuzzy Tables

A simple, flexible, and fast table component for React with built-in sorting, filtering, and customization options.

## Installation

```bash
npm install fuzzy-tables
# or
yarn add fuzzy-tables
```

After installing the package you just need to add the styles on the root layout of your project:
```tsx
import 'fuzzy-tables/styles.css';
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

### 3. From Zod Object

You can also build a table from a Zod object. Fuzzy Tables will automatically infer the type of each field and render it accordingly as single line, date, checkbox, multiple select, single select, or object array.

```tsx
import { z } from 'zod'
const Table = buildTable(z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  status: z.enum(['active', 'inactive']),
  tags: z.array(z.string()),
  lastLogin: z.date(),
  isVerified: z.boolean(),
  metadata: z.object({
    role: z.string(),
    level: z.number(),
  }),
}))
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
          <li key={row.id}>{row.name}</li>
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

  // Important! The handler must not mutate along renders if not needed!!
  const editHandler = useCallback((row) => {
    console.log('Editing row:', row);
    // Open edit modal, etc.
  }, []);
  Table.useHandler('edit', editHandler);

  // Important! The handler must not mutate along renders if not needed!!
  const deleteHandler = useCallback((row) => {
    console.log('Deleting row:', row);
    // Show confirmation dialog, etc.
  }, []);
  Table.useHandler('delete', deleteHandler);

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

## Forms Features

Fuzzy Tables seamlessly integrates table and form functionality, recognizing that applications often need to create and update records with fields that mirror table columns. This unified approach simplifies development by maintaining consistency between your data display and input interfaces.

Fuzzy Tables provides two forms components: `CreateForm` and `UpdateForm`. These forms will render
each field accordingly based on `fields` prop. Currently displaying fields are:

- Text input
- Date input
- Checkbox

Support for more fields will be released soon.

These are the mappings for each zod object type:
- `z.string()` -> Text input
- `z.boolean()` -> Checkbox
- `z.date()` -> Date input

Optional fields are supported. Adding `.optional()` to a field will not enforce the field to be filled.

### CreateForm Example

The `CreateForm` component is used to create new records. It takes a list of fields and a submit handler.

```tsx
import { zodFromFields } from 'fuzzy-tables/types';
import { z } from 'zod';

// These same fields can be used to build a table!!!
const tableFields = [
  { field: 'name', header: 'Name', z: z.string() },
  { field: 'email', header: 'Email', z: z.string().email() },
  { field: 'status', header: 'Status', z: z.enum(['active', 'inactive']) },
]
const upsertSchema = zodFromFields(tableFields);

const App = () => {
  const createFormRef = useRef<CreateFormRef>(null);
  return (
    <>
      <button onClick={() => createFormRef.current?.open()}>Create</button>
      <CreateForm<z.infer<typeof upsertSchema>>
        fields={tableFields}
        ref={createFormRef}
        title='New Record'
        description='Create a new record by filling the fields below'
        onSubmit={async (id, formData) => {
          // Your submit logic here
        }}
        getErrorMessage={(error) => {
          // Your error message logic here
          // error could be TRPCClientError, ZodError, NetworkError, etc.
          // Individual field errors are already handled by default, this function
          // is only used for parsing global errors into a string message
          return 'An error occurred';
        }}
      />
    </>
  )
}
```

Do not loose typings on your forms! `formData` will be typed from `z.infer<typeof upsertSchema>`

#### Currently missing features

TODO'S:
- Improve installation experience by getting rid of the need to import css on root
- Add useBuildTable hook
- Add support for more fields types
- Add support for custom fields
- Add support for custom validation
- Add testing
- Build documentation website
