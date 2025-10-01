// Fetch SVG content for a given Lucide icon name
export const getSvgFromLucide = async (iconName: string): Promise<string> => {
  try {
    const url = `https://lucide.dev/icons/${iconName}.svg`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch SVG: ${response.statusText}`);
    return await response.text(); // return full SVG markup
  } catch (error) {
    console.error(`Error fetching SVG for "${iconName}":`, error);
    return ""; // fallback empty SVG
  }
};
