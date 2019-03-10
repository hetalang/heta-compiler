const { Quantity } = require('./quantity');
const { exception, SchemaValidationError } = require('./utilities');
const { Compartment } = require('./compartment');

class Species extends Quantity {
  constructor(ind){
    super(ind);
  }
  merge(q, skipChecking){
    if(!skipChecking) Species.isValid(q);
    super.merge(q, skipChecking);

    this.compartmentRef = q.compartmentRef;

    return this;
  }
  static get schemaName(){
    return 'SpeciesP';
  }
  get className(){
    return 'Species';
  }
  toQ(){
    let res = super.toQ();
    res.compartmentRef = this.compartmentRef;
    return res;
  }

  populate(storage){
    super.populate(storage);
    if(!this.compartmentRef) {
      exception(`compartmentRef is not set for ${this.index}`);
    } else {
      let target = storage.find((x) => x.id===this.compartmentRef);
      if(!target) {
        exception(`compartmentRef reffered to absent value "${this.compartmentRef}"`);
      } else {
        if(!(target instanceof Compartment)) {
          exception(`compartmentRef reffered to not a compartment "${this.compartmentRef}"`);
        }else{
          this.compartment = target;
        }
      }
    }
  }

}

module.exports = {
  Species
};
