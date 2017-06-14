// test('check that tape is working', t => {
//   t.equal(1 + 2, 3, 'it works')
//   t.end()
// })
//

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, [1,2,3].indexOf(4));
    });
  });
});

describe('actions', function() {
    it('random test', function() {
      (1 + 2).should.equal(3);
    });
});
