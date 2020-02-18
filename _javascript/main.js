import * as ace from 'brace';
import 'brace/mode/yaml';
import 'brace/theme/github';
import 'brace/keybinding/vim';
import YAML from 'yamljs';
import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';

const dummyData = `
units:
  - name: checkout_app
    metadata:
      type: service
      context: booking
      location: kubernetes
      team: team_a
    dependsOn:
    - checkout_db
  - name: checkout_db
    metadata:
      type: database
      context: booking
      location: rds
      team: team_a
`;

const editor = ace.edit('editor')
editor.getSession().setMode('ace/mode/yaml');
editor.setTheme('ace/theme/github');
editor.setValue(dummyData);
editor.commands.addCommand({
  name: "Render Graph",
  bindKey: { win: "Ctrl-Enter", mac: "Command-Enter" },
  exec: (editor) => {
    window.render();
  }
});
editor.commands.addCommand({
  name: "Turn on vim mode",
  bindKey: { win: "Ctrl-Shift-Enter", mac: "Command-Shift-Enter" },
  exec: (editor) => {
    editor.setKeyboardHandler("ace/keyboard/vim");
  }
});

class AllElements {
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

      let groups = groupUnitsBy(filteredUnits, currentDirective);
      let output = "";
      Object.keys(groups).forEach((groupName) => {
        const unitsOfGroup = groups[groupName];
        if(Boolean(groupName)) {
          output += `subgraph cluster_${currentDirective}_${groupName} {\n`;
          output += `href = \"${currentDirective}___${groupName}\";\n`;
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
        output += `${unit.name} [label=\"${unit.name}\"]; \n`;
      });
      return output;
    }
  }
  resolveConnections(filteredUnits) {
    const names = filteredUnits.map((u) => u.name);
    let output = "";
    filteredUnits.forEach((unit) => (unit.dependsOn || []).forEach((dependency) => {
      if (names.indexOf(dependency) !== -1) {
        output += `${unit.name} -> ${dependency};`
      }
    }));
    return output;
  }
}

const groupUnitsBy = (units, directive) => units.reduce(
  (result, unit) => ({...result, [unit.metadata[directive] || ""]: [...(result[unit.metadata[directive] || ""] || []), unit]}),
  {});

window.render = () => {
  const parsedYAML = YAML.parse(editor.getValue());
  window.allElements = new AllElements(parsedYAML);
  window.output = window.allElements.filteredGraph((parsedYAML.filter || {}), (parsedYAML.directives || []));

  new Viz({ Module, render })
    .renderSVGElement(window.output)
    .then((element) => {
      window.graphElement = document.getElementById("graph");
      graphElement.innerHTML = '';
      graphElement.appendChild(element);
    });
};

document.getElementById("render").onclick = (e) => {
  e.preventDefault();
  window.render();
};

document.getElementById("toggle-editor").onclick = (event) => {
  const e = document.getElementById("editor-column");
  const c = document.getElementById("graph-column");
  e.classList.toggle('is-hidden');
  e.classList.toggle('is-half');
  c.classList.toggle('is-full');
  c.classList.toggle('is-half');
};
