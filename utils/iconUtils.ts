// utils/iconUtils.ts

/**
 * Semantic mappings for better category-to-icon matching
 */
const SEMANTIC_MAPPINGS: Record<string, string[]> = {
  // Transportation & Vehicles
  car: ['car', 'vehicle', 'auto', 'automobile', 'sedan'],
  bike: ['bike', 'bicycle', 'scooter', 'cycle', 'e-bike', 'ebike'],
  truck: ['truck', 'lorry', 'delivery', 'van', 'freight'],
  bus: ['bus', 'transit', 'public-transport'],
  
  // Energy & Power
  battery: ['battery', 'power', 'energy', 'charge', 'fuel'],
  'battery-low': ['low-battery', 'depleted', 'empty'],
  'battery-full': ['full-battery', 'charged', 'complete'],
  zap: ['electric', 'lightning', 'volt', 'current', 'charging'],
  plug: ['plug', 'charger', 'socket', 'connector'],
  
  // Locations & Navigation
  'map-pin': ['location', 'place', 'pin', 'marker', 'position', 'point', 'spot'],
  navigation: ['navigation', 'direction', 'route', 'path', 'gps'],
  home: ['home', 'house', 'residence', 'base'],
  building: ['building', 'structure', 'facility'],
  
  // Status & Alerts
  'check-circle': ['safe', 'ok', 'good', 'healthy', 'active', 'online', 'operational'],
  'alert-triangle': ['warning', 'caution', 'alert', 'attention'],
  'alert-circle': ['danger', 'error', 'critical', 'emergency'],
  'x-circle': ['inactive', 'offline', 'disabled', 'broken', 'failed'],
  'alert-octagon': ['stop', 'blocked', 'restricted'],
  
  // Infrastructure
  wrench: ['maintenance', 'repair', 'service', 'tool', 'fix'],
  settings: ['config', 'setup', 'preferences', 'options'],
  wifi: ['network', 'connection', 'signal', 'wireless'],
  'wifi-off': ['disconnected', 'no-signal', 'offline-network'],
  
  // Stations & Hubs
  radio: ['station', 'hub', 'terminal', 'depot', 'base-station'],
  'git-branch': ['branch', 'network-node', 'junction'],
  
  // General
  info: ['info', 'information', 'details', 'about'],
  globe: ['global', 'world', 'network', 'internet'],
  clock: ['time', 'schedule', 'timer', 'duration'],

  // Humans
  user: ['user', 'customer', 'client', 'person', 'member', 'account'],
  person: ['person', 'individual', 'human'],
};

/**
 * Calculate semantic similarity between a category and an icon
 */
function calculateSemanticSimilarity(category: string, iconKey: string): number {
  const catLower = category.toLowerCase().trim();
  const iconLower = iconKey.toLowerCase().trim();
  
  // Direct match gets highest score
  if (catLower === iconLower) return 1.0;
  
  // Check if category matches any semantic mapping for this icon
  const semanticWords = SEMANTIC_MAPPINGS[iconKey];
  if (semanticWords) {
    for (const word of semanticWords) {
      if (catLower === word.toLowerCase()) return 0.9;
      if (catLower.includes(word.toLowerCase()) || word.toLowerCase().includes(catLower)) {
        return 0.8;
      }
    }
  }
  
  // Check reverse - if icon name appears in category
  if (catLower.includes(iconLower) || iconLower.includes(catLower)) {
    return 0.7;
  }
  
  // Fuzzy string matching for remaining cases
  return fuzzyStringSimilarity(catLower, iconLower) * 0.6;
}

/**
 * Improved fuzzy string similarity using Levenshtein-based approach
 */
function fuzzyStringSimilarity(a: string, b: string): number {
  if (a === b) return 1.0;
  if (a.length === 0 || b.length === 0) return 0.0;
  
  // Simple character overlap scoring
  const aChars = new Set(a.toLowerCase());
  const bChars = new Set(b.toLowerCase());
  const intersection = new Set([...aChars].filter(x => bChars.has(x)));
  const union = new Set([...aChars, ...bChars]);
  
  return intersection.size / union.size;
}

/**
 * Assign unique icons to categories with improved semantic matching
 */
export function assignIconsToCategories(
  categories: string[], 
  availableIcons: string[]
): Record<string, string> {
  // Enhanced icon pool with better transportation/utility coverage
  const enhancedIconPool = [
  // Transportation
  'car', 'bike', 'truck', 'bus',
  // Energy & Power  
  'battery', 'battery-low', 'battery-full', 'zap', 'plug',
  // Status
  'check-circle', 'alert-triangle', 'alert-circle', 'x-circle', 'alert-octagon',
  // Location & Navigation
  'map-pin', 'navigation', 'home', 'building', 'radio',
  // Utility
  'wrench', 'settings', 'wifi', 'wifi-off', 'info', 'globe', 'clock',
  // Humans - add these explicitly
  'user', 'person',
  // Fallback from original pool
  ...availableIcons.filter(icon => 
    ![
      'car', 'bike', 'truck', 'bus', 'battery', 'battery-low', 'battery-full', 
      'zap', 'plug', 'check-circle', 'alert-triangle', 'alert-circle', 
      'x-circle', 'alert-octagon', 'map-pin', 'navigation', 'home', 
      'building', 'radio', 'wrench', 'settings', 'wifi', 'wifi-off', 
      'info', 'globe', 'clock', 'user', 'person'
    ].includes(icon)
  )
];

  
  const assignments: Record<string, string> = {};
  const usedIcons = new Set<string>();
  
  // Sort categories by length (longer names first for better matching)
  const sortedCategories = [...categories].sort((a, b) => b.length - a.length);
  
  for (const category of sortedCategories) {
    let bestScore = -1;
    let bestIcon = 'map-pin'; // fallback
    
    for (const icon of enhancedIconPool) {
      if (usedIcons.has(icon)) continue;
      
      const score = calculateSemanticSimilarity(category, icon);
      if (score > bestScore) {
        bestScore = score;
        bestIcon = icon;
      }
    }
    
    assignments[category] = bestIcon;
    usedIcons.add(bestIcon);
    
    // If we run out of unique icons, allow reuse but prefer unused ones
    if (usedIcons.size >= enhancedIconPool.length) {
      usedIcons.clear();
    }
  }
  
  return assignments;
}

/**
 * Get status-based icon with fallback logic
 */
export function getStatusIcon(status: string): string {
  const statusMap: Record<string, string> = {
    'active': 'check-circle',
    'safe': 'check-circle', 
    'online': 'check-circle',
    'operational': 'check-circle',
    'warning': 'alert-triangle',
    'caution': 'alert-triangle',
    'alert': 'alert-triangle',
    'danger': 'alert-circle',
    'error': 'alert-circle',
    'critical': 'alert-circle',
    'emergency': 'alert-circle',
    'inactive': 'x-circle',
    'offline': 'x-circle',
    'disabled': 'x-circle',
    'broken': 'x-circle',
    'failed': 'x-circle'
  };
  
  return statusMap[status.toLowerCase()] || 'info';
}

/**
 * Legacy function for backward compatibility
 */
export function stringSimilarity(a: string, b: string): number {
  return fuzzyStringSimilarity(a, b);
}