/*
    Top class for all other items of platform
*/

const _ = require('lodash');
const randomId = require('random-id');

const lengthRandom = 9;
const patternRandom = 'aA0';

/*
  class Top

  properties: {
      _id: <string>,
      randomId: <boolean>,
      _container: <Container>
  }

*/
class Top { // or const Top = class {...}
    /*
    new Top({id: 'ttt1'});
    */
    constructor(q = {}){
        let logger = this._container.logger;

        if (typeof q.id === 'string') {
            if (/^[_a-zA-Z][_a-zA-Z0-9]*/.test(q.id)) {
                this._id = q.id;
                this.isRandomId = false;
            } else {
                logger.error(`Wrong format of id: "${q.id}"`, {type: 'QueueError'});
            }
        } else if (typeof q.id === 'undefined') {
            this._id = 'rand_' + randomId(lengthRandom, patternRandom);
            this.isRandomId = true;
        } else {
            logger.error(`id must be string, got ${q.id}`, {type: 'QueueError'});
        }
    }
    get id(){
        return this._id;
    }
    _toQ(options = {}){
        let q = {};
        if (!this.isRandomId) q.id = this.id;

        return q;
    }
    toQ(options = {}){
        let q = this._toQ(options);
        q.action = 'defineTop';

        return q;
    }
}

module.exports = {
    Top
};
