const { Quantity } = require('./quantity');
const { Numeric } = require('./numeric');
const { Expression } = require('./expression');
const _ = require('lodash');

class Event extends Quantity {
  constructor(){
    super();

    this.assignments = [];
  }
  merge(q, skipChecking){
    if(!skipChecking) Event.isValid(q);
    super.merge(q, skipChecking);

    if(q.assignments && q.assignments.length>0) {
      q.assignments.forEach((assignmentQ) => {
        let assignment = {targetRef: assignmentQ.targetRef};

        let size = _.get(assignmentQ, 'size');
        if(size){
          if(size instanceof Numeric || size instanceof Expression){
            assignment.size = size;
          }else if(typeof size === 'number'){
            assignment.size = new Numeric(size);
          }else if(typeof size === 'string'){
            assignment.size = new Expression(size);
          }else if('num' in size){
            assignment.size = new Numeric(size);
          }else if('expr' in size){
            assignment.size = new Expression(size);
          }else{
            // if code is OK never throws
            throw new Error('Wrong Variable argument.');
          }
        }

        this.assignments.push(assignment);
      });
    }

    return this;
  }
  static get schemaName(){
    return 'EventP';
  }
  get className(){
    return 'Event';
  }
}

module.exports = {
  Event
};
