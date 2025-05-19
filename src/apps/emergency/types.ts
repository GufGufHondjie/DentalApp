/**
 * Shared TypeScript interfaces for the HelloMolar Emergency App.
 */

export interface FilterPreset {
  id: string;
  name: string;
  filters: {
    preferredTime: string;
    availability: string[];
    status: string;
    triageLevel?: string;
    preferredDentist?: string;
  };
}
