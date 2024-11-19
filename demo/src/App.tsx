import React from 'react';
import { buildTable } from 'fuzzy-tables';

const DEMO_DATA = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active',
    tags: ['developer', 'frontend'],
    lastLogin: new Date('2024-03-15T10:30:00Z'),
    isVerified: true,
    metadata: { role: 'admin', level: 3 }
  },
  {
    _id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'inactive',
    tags: ['designer', 'ui/ux'],
    lastLogin: new Date('2024-03-14T15:45:00Z'),
    isVerified: false,
    metadata: { role: 'user', level: 2 }
  },
  {
    _id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    status: 'active',
    tags: ['developer', 'backend'],
    lastLogin: new Date('2024-03-16T09:15:00Z'),
    isVerified: true,
    metadata: { role: 'admin', level: 4 }
  }
];

// Basic Table Example
const BasicTable = buildTable(['name', 'email', 'status']);

// Advanced Table with all field types
const AdvancedTable = buildTable(
  ['name', 'email', 'status', 'tags', 'lastLogin', 'isVerified', 'metadata'],
  ['Edit', 'Delete']
);

import { z } from 'zod'
const FromZodObject = buildTable(z.object({
  _id: z.string(),
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

const TableDemo: React.FC = () => {
  return (
    <div className="space-y-8 p-4">
      <div>
        <h2 className="text-xl font-bold mb-4">Basic Table Example</h2>
        <BasicTable data={DEMO_DATA} />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Advanced Table Example</h2>
        <p className="text-sm text-gray-600 mb-4">
          Demonstrates all supported field types and row handlers
        </p>
        <AdvancedTable data={DEMO_DATA} />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">From Zod Object</h2>
        <FromZodObject data={DEMO_DATA} />
      </div>

      <div className="text-sm space-y-2">
        <h3 className="font-bold">Features demonstrated:</h3>
        <ul className="list-disc list-inside">
          <li>Row selection (individual and bulk)</li>
          <li>Column sorting</li>
          <li>Different field type rendering (string, date, boolean, arrays, objects)</li>
          <li>Row handlers (edit/delete actions)</li>
          <li>Colored tags with rainbow effect</li>
        </ul>
      </div>
    </div>
  );
}; 

export default TableDemo;