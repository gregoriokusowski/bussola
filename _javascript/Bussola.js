// make it graphviz friendly
function sluggize(str) {
  return str.replace(/-/g,"_").replace(/ /g,"_").toLowerCase();
}

export default class Bussola {
  constructor(params) {
    this.units = params.units;
    this.defaultFilters = params.defaultFilters;
  }
  availableFilters() {
    let filters = {};
    this.availableDirectives().forEach((directive) => {
      let filtersForDirective = {};
      this.units.forEach((unit) => filtersForDirective[unit.metadata[directive]] = true);
      filters[directive] = Object.keys(filtersForDirective);
    });
    return filters;
  }
  availableDirectives() {
    let allDirectives = {};
    this.units.forEach((unit) =>
      Object.keys(unit.metadata).forEach((k, v) => allDirectives[k] = true));
    return Object.keys(allDirectives);
  }
  filteredGraph(filter, directives) {
    let dotOutput = "digraph G {\n";
    dotOutput += 'node [fontsize=8,style=filled,color="#ccf5ef"];\n';
    const filteredUnits = this.getFilteredUnits(filter);
    dotOutput += this.plotUnits(filteredUnits, directives);
    dotOutput += this.resolveConnections(filteredUnits);
    dotOutput += "}";
    return dotOutput;
  }
  getFilteredUnits(filter) {
    return this.units.filter((unit) => {
      let included = true;
      Object.keys(filter).forEach((directive) => {
        let options = filter[directive];
        if (options.indexOf(unit.metadata[directive]) === -1) included = false;
      });
      return included;
    });
  }
  plotUnits(filteredUnits, directives) {
    if (directives.length) {
      let currentDirective = directives[0];
      let restOfDirectives = directives.slice(1);

      let groups = this.groupUnitsBy(filteredUnits, currentDirective);
      let output = "";
      Object.keys(groups).forEach((groupName) => {
        const unitsOfGroup = groups[groupName];
        if(Boolean(groupName)) {
          output += `subgraph cluster_${sluggize(currentDirective)}_${sluggize(groupName)} {\n`;
          output += "style=rounded;\n";
          if (restOfDirectives.length % 2 == 0) {
            output += 'bgcolor="#fafafa";\n';
          } else {
            output += 'bgcolor="#f6f6f6";\n';
          }
          //output += `href = \"${currentDirective}___${groupName}\";\n`;
          output += `label = \"${groupName}\";\n`;
          output += this.plotUnits(unitsOfGroup, restOfDirectives);
          output += "}\n";
        } else {
          output += this.plotUnits(unitsOfGroup, restOfDirectives);
        }
      });
      return output;

    } else {
      let output = "";
      filteredUnits.forEach((unit) => {
        output += `${sluggize(unit.name)} [label=\"${unit.name}\"]; \n`;
      });
      return output;
    }
  }
  resolveConnections(filteredUnits) {
    const names = filteredUnits.map((u) => u.name);
    let output = "";
    filteredUnits.forEach((unit) => (unit.dependsOn || []).forEach((dependency) => {
      if (names.indexOf(dependency) !== -1) {
        output += `${sluggize(unit.name)} -> ${sluggize(dependency)};`
      }
    }));
    return output;
  }
  groupUnitsBy(units, directive) {
    return units.reduce(
      (result, unit) => ({...result, [unit.metadata[directive] || ""]: [...(result[unit.metadata[directive] || ""] || []), unit]}),
      {});
  }
}
