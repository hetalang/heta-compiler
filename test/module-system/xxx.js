async function xxx(){
    return 1;
}
describe('XXX', () => {
    it('one', async () => {
        let res = await xxx();
        console.log(res);
    });
});

