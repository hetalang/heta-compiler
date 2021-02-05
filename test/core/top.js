/* global describe, it */
const Container = require('../../src/container');
const p = new Container();
const { expect } = require('chai');

describe('Check Top class', () => {
    it('Empty Top', () => {
        let t1 = new p.Top();
        expect(t1).to.have.property('_id').a('string')
        expect(t1).property('isRandomId').to.be.true;
        expect(t1).to.have.property('id').a('string')
        expect(t1.toQ()).to.be.deep.equal({action: 'defineTop'});
        expect(t1._container).to.be.instanceOf(Container);

        expect(t1._container.logger).property('hasErrors').false;
        t1._container.logger.resetErrors();
    });
    it('Top with id', () => {
        let t1 = new p.Top({id: 'xxx'});
        expect(t1).to.have.property('_id', 'xxx');
        expect(t1).property('isRandomId').to.be.false;
        expect(t1).to.have.property('id', 'xxx');
        expect(t1.toQ()).to.be.deep.equal({id: 'xxx', action: 'defineTop'});
        expect(t1._container).to.be.instanceOf(Container);
        
        expect(t1._container.logger).property('hasErrors').false;
        t1._container.logger.resetErrors();
    });
    it('Error: not a string id', () => {
        let t1 = new p.Top({id: 123});

        expect(t1._container.logger).property('hasErrors').true;
        t1._container.logger.resetErrors();
    });
    it('Error: wrong id string', () => {
        let t1 = new p.Top({id: '123'});
        
        expect(t1._container.logger).property('hasErrors').true;
        t1._container.logger.resetErrors();
    });
});
