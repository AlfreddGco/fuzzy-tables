# Fuzzy Tables

A simple, flexible, and fast table component for React.

#### Ways to build a table

From a list of fields:

```tsx
const Table = buildTable(['name', 'email', 'status'])
```

From an array of {header,field,render}:

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
  }
])
```