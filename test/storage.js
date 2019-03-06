const { Storage } = require('../src/storage');
const should = require('should');

describe('Unit tests for Storage', () => {
  var s;

  it('Creating empty storage.', () => {
    s = new Storage();
  });

  it('Set element without space and check return.', () => {
    let out = s.set({id: 'x1'}, {prop1: 'val1'});
    out.should.have.property('prop1', 'val1');
    out.should.have.property('id', 'x1');
    out.should.property('space').be.equal(undefined);
  });

  it('Set element with the same id.', () => {
    let out = s.set({id: 'x1'}, {prop2: 'val2'});
    out.should.have.not.property('prop1', 'val1');
    out.should.have.property('prop2', 'val2');
    out.should.have.property('id', 'x1');
    out.should.property('space').be.equal(undefined);
  });

  it('Set element with space and check return.', () => {
    let out = s.set({id: 'x2', space: 'one'}, {prop1: 'val3'});
    out.should.have.property('prop1', 'val3');
    out.should.have.property('id', 'x2');
    out.should.property('space', 'one');
  });

  it('Set element with the same id and space.', () => {
    let out = s.set({id: 'x2', space: 'one'}, {prop2: 'val4'});
    out.should.have.not.property('prop1');
    out.should.have.property('prop2', 'val4');
    out.should.have.property('id', 'x2');
    out.should.property('space', 'one');
  });

  it('When set id and space inside value should be ignored.', () => {
    let out = s.set({id: 'x3', space: 'one'}, {prop2: 'val5', id: 'y3', space: 'two'});
    out.should.have.property('id', 'x3');
    out.should.property('space', 'one');
  });

  it('Set element without id throws error.', () => {
    should.throws(() => {
      s.set({space: 'one'}, {prop1: 'val6'});
    });
  });

  it('Set element without id and space throw error.', () => {
    should.throws(() => {
      s.set({}, {prop1: 'val7'});
    });
  });

  it('Get existed element by id', () => {
    let out = s.get({id: 'x1'});
    out.should.has.property('prop2', 'val2');
  });

  it('Get existed element by id and space.', () => {
    let out = s.get({id: 'x2', space: 'one'});
    out.should.has.property('prop2', 'val4');
  });

  it('Get not existed element by id result in undefined.', () => {
    let out = s.get({id: 'x2'});
    should(out).be.undefined();
  });

  it('Get not existed element by id and space result in undefined.', () => {
    let out = s.get({id: 'x1', space: 'one'});
    should(out).be.undefined();
  });

  it('Get element without id throws error.', () => {
    should.throws(() => {
      s.get({space: 'one'});
    });
  });

  it('Get element without id and space throw error.', () => {
    should.throws(() => {
      s.get({});
    });
  });

  it('Check length of storage.', () => {
    s.should.lengthOf(3);
  });

  it('Delete existed element by id', () => {
    let out = s.delete({id: 'x1'});
    out.should.has.property('prop2', 'val2');
    s.should.lengthOf(2);
  });

  it('Delete existed element by id and space.', () => {
    let out = s.delete({id: 'x2', space: 'one'});
    out.should.has.property('prop2', 'val4');
    s.should.lengthOf(1);
  });

  it('Delete not existed element by id result in error.', () => {
    should.throws(() => {
      s.delete({id: 'x2'});
    });
    s.should.lengthOf(1);
  });

  it('Delete not existed element by id and space result in error.', () => {
    should.throws(() => {
      s.delete({id: 'x1', space: 'one'});
    });
    s.should.lengthOf(1);
  });

  it('Delete element without id throws error.', () => {
    should.throws(() => {
      s.delete({space: 'one'});
    });
  });

  it('Delete element without id and space throw error.', () => {
    should.throws(() => {
      s.delete({});
    });
  });
});
