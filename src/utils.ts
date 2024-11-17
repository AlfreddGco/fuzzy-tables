import _ from 'lodash'

export const rainbow = [
  {
    strong: 'rgb(91, 89, 190)',//purple
    hex: '#5B59BE',
    alpha: (v: number) => `rgba(91, 89, 190, ${v})`,
    light: '#eeeef9',
  },
  {
    strong: 'rgb(191, 90, 90)',//red
    hex: '#BF5A5A',
    alpha: (v: number) => `rgba(191, 90, 90, ${v})`,
    light: '#f8eeee',
  },
  {
    strong: 'rgb(149, 166, 70)',//orbit green
    hex: ' #95A646',
    alpha: (v: number) => `rgba(149, 166, 70, ${v})`,
    light: '#f5f6ed',
  },
  {
    strong: 'rgb(89, 173, 190)',//blue
    hex: '#59ADBE',
    alpha: (v: number) => `rgba(89, 173, 190, ${v})`,
    light: '#e0edef',
  },
  {
    strong: 'rgb(255, 145, 64)', // orange
    hex: '#ff9140',
    alpha: (v: number) => `rgba(255, 145, 64, ${v})`,
    light: '#ffd5b8',
  },
  {
    strong: 'rgb(0, 167, 47)',//lemon green
    hex: '#00A72F',
    alpha: (v: number) => `rgba(0, 167, 47, ${v})`,
    light: '#ebf6eb',
  },
]

export const headerNameFromField = (columnName: string): string => {
  if(columnName[0] === columnName[0].toLowerCase() || columnName.includes('_')) {
    return _.startCase(columnName.replace('_', ' '))
  }
  return columnName
}

type ValueType = 'date' | 'undefined' | 'boolean' | 'object[]' | 'string[]' | 'string'

export const inferTypeFromValue = (value: any): ValueType => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
  if (typeof value === 'string' && dateRegex.test(value)) {
    return 'date'
  }
  if (value === undefined) return 'undefined'
  if (value === 'true' || value === true) return 'boolean'
  if (value === 'false' || value === false) return 'boolean'
  if (Array.isArray(value) && value.length > 0 && value.some(v => typeof v === 'object' && v !== null)) {
    return 'object[]'
  }
  if(Array.isArray(value)) {
    return 'string[]'
  }
  return 'string'
}