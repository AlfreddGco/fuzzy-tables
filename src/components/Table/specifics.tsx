import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { headerNameFromField } from '../../utils'

import { 
  DropdownMenu,
  DropdownMenuTrigger, 
  DropdownMenuContent,
  DropdownMenuItem
} from './dropdown-menu'

import styled from 'styled-components'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  DotsHorizontalIcon
} from '@radix-ui/react-icons'

interface SortingField {
  field: string
  direction: 'asc' | 'desc'
}

interface TableHeaderProps {
  field: string
  sortingFields: SortingField[]
  toggleSortingField: (field: string) => void
  headerName?: string
}

export const TableHeader: React.FC<TableHeaderProps> = ({ headerName, field, sortingFields, toggleSortingField }) => {
  const sortingField = sortingFields.find((f) => f.field === field)
  return (
    <th key={field} className="p-2 text-left text-[rgba(0,0,0,0.5)]"
      onClick={() => toggleSortingField(field)}
    >
      <div className="flex items-center justify-between gap-1">
        <span>{headerName || headerNameFromField(field)}</span>
        {sortingField && (
          sortingField.direction === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />
        )}
      </div>
    </th>
  )
}

interface RowErrorBoundaryProps {
  children: React.ReactNode
}

export const RowErrorBoundary: React.FC<RowErrorBoundaryProps> = ({ children }) => {
  return (
    <ErrorBoundary fallback={<div>Error</div>}>
      {children}
    </ErrorBoundary>
  )
}

export const StyledTable = styled.table`
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #e5e7eb;
  border-top: 0;
  font-size: 0.85em;

  thead {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: white;
  }

  th {
    background-color: white;
    border-top: 1px solid #e5e7eb;
    border-bottom: 1px solid #e5e7eb;
  }

  th:not(:last-child), td:not(:last-child) {
    border-right: 1px solid #e5e7eb;
  }

  th:not(:first-child):not(:last-child) {
    min-width: 10em;
  }

  tr:not(:first-child) > td{
    border-top: 1px solid #e5e7eb;
  }

  tr{
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
    transition-timing-function: cubic-bezier(.4,0,.2,1);
    transition-duration: .15s;
    cursor: pointer;
  }

  tr:hover{
    background-color: hsla(240, 5%, 96%, 0.5);
  }

  td{
    max-width: 20em;
    overflow: hidden;
    white-space: nowrap;
  }

  td:not([data-type="string[]"]){
    text-overflow: ellipsis;
  }
`

interface TableHandlerProps {
  handlers: string[]
  onHandlerClick: (handler: string) => void
}

export const TableHandler: React.FC<TableHandlerProps> = ({ handlers, onHandlerClick }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className='w-full h-full'>
        <button 
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          className="p-1 hover:bg-gray-100 bg-white"
        >
          <DotsHorizontalIcon />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {handlers.map((handler) => (
          <DropdownMenuItem
            key={handler}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onHandlerClick(handler);
            }}
          >
            {handler}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}