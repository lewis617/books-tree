var urlParams;
(window.onpopstate = function () {
  var match,
    pl = /\+/g,  // Regex for replacing addition symbol with a space
    search = /([^&=]+)=?([^&]*)/g,
    decode = function (s) {
      return decodeURIComponent(s.replace(pl, " "));
    },
    query = window.location.search.substring(1);

  urlParams = {};
  while (match = search.exec(query))
    urlParams[decode(match[1])] = decode(match[2]);
})();

if (urlParams.hideMenu) {
  document.querySelector("#nav").style.display = 'none';
}

var Log = {
  elem: false,
  write: function (text) {
    if (!this.elem)
      this.elem = document.getElementById('log');
    this.elem.innerHTML = text;
    this.elem.style.left = (document.body.clientWidth - this.elem.offsetWidth) / 2 + 'px';
  }
};


function init(jsonName) {
  document.querySelector("#infovis").innerHTML = '';
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
        var json = JSON.parse(xhr.responseText);

        var data = json.diagram.elements;
        var traverseData = function (data) {
          if (!data || !data.title) {
            return;
          }
          data.name = data.title;
          data.children.forEach(function (child) {
            traverseData(child);
          });
        };
        traverseData(data);

        var ht = new $jit.Hypertree({
          //id of the visualization container
          injectInto: 'infovis',
          //Add navigation capabilities:
          //zooming by scrolling and panning.
          Navigation: {
            enable: true,
            panning: urlParams['panning'] ? parseInt(urlParams['panning']) : true,
            zooming: urlParams['zooming'] ? parseInt(urlParams['zooming']) : 10
          },
          //Change node and edge styles such as
          //color, width and dimensions.
          Node: {
            dim: 9,
            color: "#f00"
          },
          Edge: {
            lineWidth: 1,
            color: "#088"
          },
          onBeforeCompute: function (node) {
            Log.write("centering " + node.name + "...");
          },
          //Attach event handlers and add text to the
          //labels. This method is only triggered on label
          //creation
          onCreateLabel: function (domElement, node) {
            domElement.innerHTML = node.name;
            $jit.util.addEvent(domElement, 'click', function () {
              ht.onClick(node.id, {
                onComplete: function () {
                  ht.controller.onComplete();
                }
              });
            });
          },
          //Change node styles when labels are placed
          //or moved.
          onPlaceLabel: function (domElement, node) {
            var style = domElement.style;
            style.display = '';
            style.cursor = 'pointer';
            if (node._depth <= 1) {
              style.fontSize = "0.8em";
              style.color = "#ddd";

            } else {
              style.fontSize = "0.7em";
              style.color = "#555";

            }

            var left = parseInt(style.left);
            var w = domElement.offsetWidth;
            style.left = (left - w / 2) + 'px';
          },

          onComplete: function () {
            Log.write("done");
          }
        });
        ht.loadJSON(data);
        ht.refresh();
      }
    }
  };
  xhr.open('get', 'json/' + jsonName + '.json', true);
  xhr.send(null);
}

var activeLink = function (jsonName) {
  var linkList = document.querySelectorAll("a");
  for (var i = 0; i < linkList.length; i++) {
    linkList[i].removeAttribute('class');
    if (linkList[i].getAttribute('href') === '#' + jsonName) {
      linkList[i].className = 'active';
    }
  }
};

window.onload = function () {
  var jsonName = location.hash.slice(1) || 'beginning-html';
  setTimeout(function () {
    activeLink(jsonName);
    init(jsonName);
  }, parseInt(urlParams.lazy) || 0)
};

document.querySelector("#nav")
  .addEventListener('click', function (e) {
    var jsonName = e.target.href.split('#')[1] || 'beginning-html';
    activeLink(jsonName);
    init(jsonName);
  }, false);
