fetch('/params').then((response) => {
  response.json().then((params) => {
      //document.getElementById('params').value = JSON.stringify(params);
      window.appState.directives = params.Directives;
      window.appState.availableFilters = params.Filters;
      //window.appState.filters = params.Filters;
      window.renderDirectives();
      window.renderDot();
    }
  );
});

window.appState = {
  directives: [],
  filters: {}
};

window.renderDirectives = function() {
  var directivesContainer = document.getElementById("directives");
  for (var directive of window.appState.directives) {
    var span = document.createElement('span');
    span.innerHTML = directive;
    directivesContainer.appendChild(span);
  }
  const sortable = new Draggable.Sortable(directivesContainer, { draggable: 'span' });
  sortable.on('sortable:stop', e => window.setTimeout(_ => {
    //console.log(directivesContainer.children.length)
    window.appState.directives = Array.from(e.newContainer.children).map(c => c.innerHTML);
    window.renderDot();
  }))
};

window.graphElement = document.getElementById("graph");

window.reset = function() {
  window.appState.filters = {};
  window.renderDot();
};

window.renderDot = function () {
  console.log(window.appState);
  fetch('/render', {
    method: 'POST',
    body: JSON.stringify({"Directives":window.appState.directives,
                          "Filters":window.appState.filters})
  }).then(response => 
    response.text().then((text) => {
      var viz = new Viz();
      viz.renderSVGElement(text)
        .then(function(element) {
          graphElement.innerHTML = '';
          graphElement.appendChild(element);
          var links = graphElement.getElementsByTagName("a");
          for (var link of links) {
            link.onclick = function(e) {
              var filterAndAttribute = e.srcElement.parentElement.attributes["xlink:href"].value.substring(1).split("___");
              window.appState.filters[filterAndAttribute[0]] = window.appState.filters[filterAndAttribute[0]] || [];
              window.appState.filters[filterAndAttribute[0]].push(filterAndAttribute[1]);
              window.renderDot();
              e.preventDefault();
              return false;
            }
            link.oncontextmenu = function(e) {
              var filterAndAttribute = e.srcElement.parentElement.attributes["xlink:href"].value.substring(1).split("___");
              window.appState.filters[filterAndAttribute[0]] = window.appState.filters[filterAndAttribute[0]] || [];
              window.appState.filters[filterAndAttribute[0]].push(filterAndAttribute[1]);
              e.preventDefault();
              return false;
            }
          }
        })
        .catch(error => {
          console.error(error);
        });
    })
  )
};
