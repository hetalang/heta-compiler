const { isReservedWord, isValidId } = require('../identifier');

class NameAllocator {
  constructor(names = []) {
    this.names = new Set(names);
  }

  importName(sourceId) {
    for (let n = 1; ; n++) {
      let candidate = `sbml_${sourceId}_${n}`;
      if (!this.names.has(candidate)) {
        this.names.add(candidate);
        return candidate;
      }
    }
  }

  generatedName(base) {
    let candidate = base;
    for (let n = 1; this.names.has(candidate); n++) {
      candidate = `${base}_${n}`;
    }
    this.names.add(candidate);
    return candidate;
  }
}

function buildGlobalIdResolver(model) {
  const elementNames = new Set([
    'functionDefinition', 'speciesType', 'compartment', 'species', 'reaction',
    'parameter', 'event'
  ]);
  const sourceIds = model.elements
    .filter((element) => elementNames.has(element.name) || element.elements)
    .flatMap((element) => element.elements || [])
    .filter((element) => elementNames.has(element.name))
    .map((element) => element.attributes?.id)
    .filter((id) => id !== undefined);
  const unchangedIds = sourceIds.filter((id) => isValidId(id) && !isReservedWord(id));
  const allocator = new NameAllocator(unchangedIds);
  const renamed = new Map();

  sourceIds.forEach((id) => {
    if (!isValidId(id) || isReservedWord(id)) {
      renamed.set(id, allocator.importName(id));
    }
  });

  return { allocator, resolve: (id) => renamed.get(id) || id };
}

function buildLocalResolver(sourceIds, globalResolve) {
  const allocator = new NameAllocator(sourceIds.filter((id) => isValidId(id) && !isReservedWord(id)));
  const renamed = new Map();
  sourceIds.forEach((id) => {
    if (!isValidId(id) || isReservedWord(id)) {
      renamed.set(id, allocator.importName(id));
    }
  });
  return (id) => renamed.get(id) || globalResolve(id);
}

function rewriteMathIdentifiers(element, resolve) {
  if (!element) return;
  if (element.name === 'ci' && element.elements?.[0]?.text !== undefined) {
    element.elements[0].text = resolve(element.elements[0].text.trim());
  }
  element.elements?.forEach((child) => rewriteMathIdentifiers(child, resolve));
}

module.exports = {
  buildGlobalIdResolver,
  buildLocalResolver,
  rewriteMathIdentifiers
};
