class XArray extends Array{
  getById(id){
    return this.find((x) => x.id = id);
  }
  getByIndex(index){
    return this.find((x) => x.index = index);
  }
  selectByClassName(className){
    return this.filter((x) => x.className===className);
  }
  selectByInstance(constructor){
    return this.filter((x) => x instanceof constructor);
  }
}

module.exports = XArray;
