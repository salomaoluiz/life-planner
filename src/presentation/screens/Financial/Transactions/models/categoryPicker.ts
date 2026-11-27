// What the transaction filters need to name a category id (spec 045 FR 11).
export interface PickerCategory {
  archived: boolean;
  iconColor?: string;
  id: string;
  name: string;
  parentId?: string;
  type: string;
}
