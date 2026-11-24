export function specificationValue(item, column, values = {}) {
  const value = column === 'Color' && item.color ? item.color : item.specs.find(([label]) => label === column)?.[1];
  const text = value == null ? '' : String(value).trim();
  return !text || /^[-–—]$/.test(text) ? 'N/A' : (values[text] ?? text);
}

export function numericSpecificationColumns(items, columns) {
  return new Set(columns.filter(column => {
    const values = items.map(item => specificationValue(item, column)).filter(value => value !== 'N/A');
    return values.length > 0 && values.every(value => /^[<>≤≥~±]?\s*[+−-]?(?:\d|\.\d)/.test(value));
  }));
}

export function overviewColumns(items) {
  if (items.length && items.every(item => item.category === 'super-chrome-film')) return ['Color'];
  const columns = [...new Set(items.flatMap(item => item.specs.map(([label]) => label)))];
  return items.some(item => item.color) ? ['Color', ...columns] : columns;
}
