// converts {id: 'k1', space: 'one'} => 'one.k1'
function getIndexFromQ(q = {}){
  if(q.space!==undefined){
    return `${q.space}::${q.id}`;
  }else{
    return q.id;
  }
}

module.exports = {
  getIndexFromQ
};
