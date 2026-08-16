export interface CategoryOption {
  value: string
  label: string
  description: string
}

/**
 * Grievance categories citizens can select. Values match the categories used
 * across mock data and the landing page (backend stores category as a free
 * string; these are the canonical set the product presents).
 */
export const GRIEVANCE_CATEGORIES: CategoryOption[] = [
  { value: 'ROAD', label: 'Roads & Infrastructure', description: 'Potholes, footpaths, drainage and public infrastructure' },
  { value: 'SANITATION', label: 'Sanitation & Waste', description: 'Garbage collection, bins and street cleanliness' },
  { value: 'WATER', label: 'Water Supply', description: 'Leakages, supply interruptions and water quality' },
  { value: 'ELECTRICITY', label: 'Electricity & Street Lighting', description: 'Power outages, fluctuations and street lights' },
  { value: 'STREET_LIGHT', label: 'Street Lighting', description: 'Faulty or missing street lights' },
  { value: 'HEALTH', label: 'Public Health', description: 'Hospital services, hygiene and disease prevention' },
  { value: 'TRANSPORT', label: 'Transport & Traffic', description: 'Buses, signals and public transport' },
  { value: 'DRAINAGE', label: 'Drainage & Sewage', description: 'Blocked drains, overflow and sewage issues' },
  { value: 'PARK', label: 'Parks & Public Spaces', description: 'Parks, benches and community spaces' },
]
