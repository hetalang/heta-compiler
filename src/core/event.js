const { Record } = require('./record');
const { Numeric } = require('./numeric');
const { Expression } = require('./expression');
const _ = require('lodash');

class Event extends Record {
  constructor(ind){
    super(ind);

    this.assignments = [];
  }
  merge(q, skipChecking){
    if(!skipChecking) Event.isValid(q);
    super.merge(q, skipChecking);

    if(q.assignments && q.assignments.length>0) {
      q.assignments.forEach((assignmentQ) => {
        let assignment = {target: assignmentQ.target};

        let size = assignmentQ.size;
        if(typeof size === 'number'){
          assignment.size = new Numeric(size, true); // skip checking because already checked
        }else if(typeof size === 'string'){
          assignment.size = new Expression(size, true);
        }else if('num' in size){
          assignment.size = new Numeric(size, true);
        }else if('expr' in size){
          assignment.size = new Expression(size, true);
        }else{
          // if code is OK never throws
          throw new Error('Wrong EventAssignment argument.');
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
