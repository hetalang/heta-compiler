/* global describe, it */

// check calculated paths

const path = require('path');
const { expect } = require('chai');
const { Builder } = require('../../src/builder');

describe('Check Builder paths with defailt options', () => {
    it('Empty coreDirName', () => {
        const b = new Builder();

        expect(b._coreDirname).to.be.equal('.');
        expect(b._distDirname).to.be.equal('dist');
        expect(b._metaDirname).to.be.equal('meta');
        expect(b._logPath).to.be.equal('build.log');
    });

    it('Relative coreDirName linux', () => {
        const b = new Builder({}, 'test/dir');

        expect(path.normalize(b._coreDirname)).to.be.equal(path.normalize('test/dir'));
        expect(path.normalize(b._distDirname)).to.be.equal(path.normalize('test/dir/dist'));
        expect(path.normalize(b._metaDirname)).to.be.equal(path.normalize('test/dir/meta'));
        expect(path.normalize(b._logPath)).to.be.equal(path.normalize('test/dir/build.log'));
    });

    it('Relative coreDirName windows', () => {
        const b = new Builder({}, 'test\\dir');

        //expect(path.normalize(b._coreDirname)).to.be.equal(path.normalize('test/dir'));
        expect(path.normalize(b._distDirname)).to.be.equal(path.normalize('test/dir/dist'));
        expect(path.normalize(b._metaDirname)).to.be.equal(path.normalize('test/dir/meta'));
        expect(path.normalize(b._logPath)).to.be.equal(path.normalize('test/dir/build.log'));
    });

    it('Absolute coreDirName linux', () => {
        const b = new Builder({}, '/test/dir');

        expect(path.normalize(b._coreDirname)).to.be.equal(path.normalize('/test/dir'));
        expect(path.normalize(b._distDirname)).to.be.equal(path.normalize('/test/dir/dist'));
        expect(path.normalize(b._metaDirname)).to.be.equal(path.normalize('/test/dir/meta'));
        expect(path.normalize(b._logPath)).to.be.equal(path.normalize('/test/dir/build.log'));
    });

    it('Absolute coreDirName windows', () => {
        const b = new Builder({}, 'C:\\test\\dir');

        //expect(path.normalize(b._coreDirname)).to.be.equal(path.normalize('C:/test/dir'));
        expect(path.normalize(b._distDirname)).to.be.equal(path.normalize('C:/test/dir/dist'));
        expect(path.normalize(b._metaDirname)).to.be.equal(path.normalize('C:/test/dir/meta'));
        expect(path.normalize(b._logPath)).to.be.equal(path.normalize('C:/test/dir/build.log'));
    });
});

describe('Check Builder paths with relative dist dir', () => {
    it('Empty coreDirName', () => {
        const b = new Builder({options: {distDir: 'dist2', metaDir: 'meta2', logPath: 'build2.log'}});

        expect(b._coreDirname).to.be.equal('.');
        expect(b._distDirname).to.be.equal('dist2');
        expect(b._metaDirname).to.be.equal('meta2');
        expect(b._logPath).to.be.equal('build2.log');
    });

    it('Relative coreDirName linux', () => {
        const b = new Builder({options: {distDir: 'dist2', metaDir: 'meta2', logPath: 'build2.log'}}, 'test/dir');

        expect(path.normalize(b._coreDirname)).to.be.equal(path.normalize('test/dir'));
        expect(path.normalize(b._distDirname)).to.be.equal(path.normalize('test/dir/dist2'));
        expect(path.normalize(b._metaDirname)).to.be.equal(path.normalize('test/dir/meta2'));
        expect(path.normalize(b._logPath)).to.be.equal(path.normalize('test/dir/build2.log'));
    });

    it('Relative coreDirName windows', () => {
        const b = new Builder({options: {distDir: 'dist2', metaDir: 'meta2', logPath: 'build2.log'}}, 'test\\dir');

        //expect(path.normalize(b._coreDirname)).to.be.equal(path.normalize('test/dir'));
        expect(path.normalize(b._distDirname)).to.be.equal(path.normalize('test/dir/dist2'));
        expect(path.normalize(b._metaDirname)).to.be.equal(path.normalize('test/dir/meta2'));
        expect(path.normalize(b._logPath)).to.be.equal(path.normalize('test/dir/build2.log'));
    });

    it('Absolute coreDirName linux', () => {
        const b = new Builder({options: {distDir: 'dist2', metaDir: 'meta2', logPath: 'build2.log'}}, '/test/dir');

        expect(path.normalize(b._coreDirname)).to.be.equal(path.normalize('/test/dir'));
        expect(path.normalize(b._distDirname)).to.be.equal(path.normalize('/test/dir/dist2'));
        expect(path.normalize(b._metaDirname)).to.be.equal(path.normalize('/test/dir/meta2'));
        expect(path.normalize(b._logPath)).to.be.equal(path.normalize('/test/dir/build2.log'));
    });

    it('Absolute coreDirName windows', () => {
        const b = new Builder({options: {distDir: 'dist2', metaDir: 'meta2', logPath: 'build2.log'}}, 'C:\\test\\dir');

        //expect(path.normalize(b._coreDirname)).to.be.equal(path.normalize('C:/test/dir'));
        expect(path.normalize(b._distDirname)).to.be.equal(path.normalize('C:/test/dir/dist2'));
        expect(path.normalize(b._metaDirname)).to.be.equal(path.normalize('C:/test/dir/meta2'));
        expect(path.normalize(b._logPath)).to.be.equal(path.normalize('C:/test/dir/build2.log'));
    });
});

describe('Check Builder paths with absolute dist dir', () => {
    it('Empty coreDirName', () => {
        const b = new Builder({options: {distDir: '/some/dir/dist2', metaDir: '/some/dir/meta2', logPath: '/some/dir/build2.log'}});

        expect(b._coreDirname).to.be.equal('.');
        expect(b._distDirname).to.be.equal('/some/dir/dist2');
        expect(b._metaDirname).to.be.equal('/some/dir/meta2');
        expect(b._logPath).to.be.equal('/some/dir/build2.log');
    });

    it('Relative coreDirName linux', () => {
        const b = new Builder({options: {distDir: '/some/dir/dist2', metaDir: '/some/dir/meta2', logPath: '/some/dir/build2.log'}}, 'test/dir');

        expect(path.normalize(b._coreDirname)).to.be.equal(path.normalize('test/dir'));
        expect(path.normalize(b._distDirname)).to.be.equal(path.normalize('/some/dir/dist2'));
        expect(path.normalize(b._metaDirname)).to.be.equal(path.normalize('/some/dir/meta2'));
        expect(path.normalize(b._logPath)).to.be.equal(path.normalize('/some/dir/build2.log'));
    });

    it('Relative coreDirName windows', () => {
        const b = new Builder({options: {distDir: '/some/dir/dist2', metaDir: '/some/dir/meta2', logPath: '/some/dir/build2.log'}}, 'test\\dir');

        //expect(path.normalize(b._coreDirname)).to.be.equal(path.normalize('test/dir'));
        expect(path.normalize(b._distDirname)).to.be.equal(path.normalize('/some/dir/dist2'));
        expect(path.normalize(b._metaDirname)).to.be.equal(path.normalize('/some/dir/meta2'));
        expect(path.normalize(b._logPath)).to.be.equal(path.normalize('/some/dir/build2.log'));
    });

    it('Absolute coreDirName linux', () => {
        const b = new Builder({options: {distDir: '/some/dir/dist2', metaDir: '/some/dir/meta2', logPath: '/some/dir/build2.log'}}, '/test/dir');

        expect(path.normalize(b._coreDirname)).to.be.equal(path.normalize('/test/dir'));
        expect(path.normalize(b._distDirname)).to.be.equal(path.normalize('/some/dir/dist2'));
        expect(path.normalize(b._metaDirname)).to.be.equal(path.normalize('/some/dir/meta2'));
        expect(path.normalize(b._logPath)).to.be.equal(path.normalize('/some/dir/build2.log'));
    });

    it('Absolute coreDirName windows', () => {
        const b = new Builder({options: {distDir: '/some/dir/dist2', metaDir: '/some/dir/meta2', logPath: '/some/dir/build2.log'}}, 'C:\\test\\dir');

        //expect(path.normalize(b._coreDirname)).to.be.equal(path.normalize('C:/test/dir'));
        expect(path.normalize(b._distDirname)).to.be.equal(path.normalize('/some/dir/dist2'));
        expect(path.normalize(b._metaDirname)).to.be.equal(path.normalize('/some/dir/meta2'));
        expect(path.normalize(b._logPath)).to.be.equal(path.normalize('/some/dir/build2.log'));
    });
});