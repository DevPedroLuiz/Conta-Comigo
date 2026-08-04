import fs from 'fs';
const path = 'src/modules/reports/components/ReportFiltersComponent.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "const handleFilterChange = (key: keyof ReportFilters, value: string) => {",
  `const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    let newFilters = { ...filters, [key]: value };
    if (key === 'startDate' && new Date(value) > new Date(newFilters.endDate)) {
      newFilters.endDate = value;
    }
    if (key === 'endDate' && new Date(newFilters.startDate) > new Date(value)) {
      newFilters.startDate = value;
    }`
);

// We need to replace the original setFilters call since we modified newFilters above
content = content.replace(
  "    const newFilters = { ...filters, [key]: value };\n    setFilters(newFilters);",
  "    setFilters(newFilters);"
);

fs.writeFileSync(path, content);
