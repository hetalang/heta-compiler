
class Scene{
  constructor(targetSpace){
    if(!targetSpace)
      throw new TypeError('targetSpace argument should be string.');
    this.targetSpace = targetSpace;
    this.population = [];
  }
  selectByInstance(constructor){
    return this.population.filter((x) => x instanceof constructor);
  }
  selectByClassName(className){
    return this.population.filter((x) => x.className===className);
  }
}
module.exports = Scene;
