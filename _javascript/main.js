import * as ace from 'brace';
import 'brace/mode/yaml';
import 'brace/theme/github';
import 'brace/keybinding/vim';
import YAML from 'yamljs';
import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';
import dummyData from './dummyData';
import Bussola from './Bussola';

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

window.render = () => {
  const parsedYAML = YAML.parse(editor.getValue());
  window.allElements = new Bussola(parsedYAML);
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
