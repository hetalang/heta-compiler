/* global describe, it */
const { expect } = require('chai');
const { convertExcelSync } = require('../../src/xlsx-connector');
const fs = require('fs');

let fullPath = __dirname + '/' + 'test.xlsx';
let sheet1 = [
  {},
  {
    'a': 1,
    'one': [undefined, 'we'],
    'two': 'xxx',
    'arr': {        
      'arr': [      
        '1',        
        '2',        
        '3'
      ]
    },
    'z': [
      'rt'
    ]
  },
  {
    'a': 3,
    'one': {
      'two': {
        'three': 'b'
      }
    },
    'two': 'ddd',
    'arr': {
      'arr': [
        'df fssa'
      ]
    }
  },
  {
    'a': 'ddd',
    'two': 7654,
    'one': {
      'two': {
        'three': 'c'
      }
    },
    'arr': {
      'arr': [
        '555 '
      ]
    }
  }
];

describe('XLSX connector', () => {
  it('Read table 1', () => {
    let fileContent = fs.readFileSync(fullPath);
    let res = convertExcelSync(fileContent, null);
    expect(res).to.be.lengthOf(4);
    expect(res).to.be.deep.equal(sheet1);

    //let json = JSON.stringify(res, null, 2);
    //console.log(json);
  });

  it('Reading not existed table throws', () => {
    let fullPath = __dirname + '/' + 'test.xlsx';
    expect( () => convertExcelSync(fullPath, null, { sheet: 4 })).to.throw(Error);
  });

  it('Read table 2 with transposition', () => {
    let fileContent = fs.readFileSync(fullPath);
    let res = convertExcelSync(fileContent, null, { sheet: 1, transpose: true });
    
    expect(res).to.be.lengthOf(4);
    expect(res).to.be.deep.equal(sheet1);
  });
});
