// categoryData.js
export async function fetchCategoryData() {
  const res = await fetch('/menu');
  if (!res.ok) throw new Error('Failed to fetch categories');
  return await res.json();
}
