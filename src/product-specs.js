export function specificationValue(item, column) {
  const value = item.specs.find(([label]) => label === column)?.[1];
  const text = value == null ? '' : String(value).trim();
  return !text || /^[-–—]$/.test(text) ? 'N/A' : text;
}

export function numericSpecificationColumns(items, columns) {
  return new Set(columns.filter(column => {
    const values = items.map(item => specificationValue(item, column)).filter(value => value !== 'N/A');
    return values.length > 0 && values.every(value => /^[<>≤≥~±]?\s*[+−-]?(?:\d|\.\d)/.test(value));
  }));
}
