// types/TableTypes.js
export class TableDescription {
  constructor(table, description, columns, primaryKey = null, businessPurpose = null) {
    this.table = table;
    this.description = description;
    this.columns = columns;
    this.primaryKey = primaryKey;
    this.businessPurpose = businessPurpose;
  }
}

export class TableRelationship {
  constructor(fromTable, toTable, joinCondition, relationshipType = 'one_to_many') {
    this.fromTable = fromTable;
    this.toTable = toTable;
    this.joinCondition = joinCondition;
    this.relationshipType = relationshipType;
  }
}