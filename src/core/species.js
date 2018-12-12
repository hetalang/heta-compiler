const { Quantity } = require('./quantity');

class Species extends Quantity {
  constructor(q){
    super(q);
    Species.isValid(q);
    this.compartmentRef = q.compartmentRef;
  }
  static get schemaName(){
    return 'SpeciesQ';
  }
  get className(){
    return 'Species';
  }
  toQ(){
    let res = super.toQ();
    res.compartmentRef = this.compartmentRef;
    return res;
  }
}

module.exports = {
  Species
};
