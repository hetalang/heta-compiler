/* global describe, it */
const Container = require('../../src/container');
const { expect } = require('chai');

describe('Check Top class', () => {
    const p = new Container();

    it('Empty Top', () => {
        let t1 = new p.classes.Top();
        expect(t1).to.have.property('_id').a('string')
        expect(t1).property('isRandomId').to.be.true;
        expect(t1).to.have.property('id').a('string')
        expect(t1.toQ()).to.be.deep.equal({action: 'defineTop'});
        expect(t1._container).to.be.instanceOf(Container);

        expect(p.logger).property('hasErrors').false;
        p.logger.resetErrors();
    });

    it('Top with id', () => {
        let t1 = new p.classes.Top({id: 'xxx'});
        expect(t1).to.have.property('_id', 'xxx');
        expect(t1).property('isRandomId').to.be.false;
        expect(t1).to.have.property('id', 'xxx');
        expect(t1.toQ()).to.be.deep.equal({id: 'xxx', action: 'defineTop'});
        expect(t1._container).to.be.instanceOf(Container);
        
        expect(p.logger).property('hasErrors').false;
        p.logger.resetErrors();
    });
    it('Error: not a string id', () => {
        let t1 = new p.classes.Top({id: 123});

        expect(p.logger).property('hasErrors').true;
        p.logger.resetErrors();
    });
    it('Error: wrong id string', () => {
        let t1 = new p.classes.Top({id: '123'});
        
        expect(p.logger).property('hasErrors').true;
        p.logger.resetErrors();
    });
});
