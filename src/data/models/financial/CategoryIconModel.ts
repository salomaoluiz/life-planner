class CategoryIconModel {
  common: boolean;
  group: string;
  labelEn: string;
  labelPt: string;
  name: string;

  constructor(params: {
    common: boolean;
    group: string;
    labelEn: string;
    labelPt: string;
    name: string;
  }) {
    this.common = params.common;
    this.group = params.group;
    this.labelEn = params.labelEn;
    this.labelPt = params.labelPt;
    this.name = params.name;
  }

  static fromJSON(data: Record<string, unknown>): CategoryIconModel {
    return new CategoryIconModel({
      common: data.common === true,
      group: String(data.group ?? "OTHER"),
      labelEn: String(data.labelEn ?? data.name),
      labelPt: String(data.labelPt ?? data.name),
      name: String(data.name),
    });
  }
}

export default CategoryIconModel;
