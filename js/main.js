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
  fetch('json/' + jsonName + '.json')
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
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
      return data;
    })
    .then(function (json) {

      var ht = new $jit.Hypertree({
        //id of the visualization container
        injectInto: 'infovis',
        //Add navigation capabilities:
        //zooming by scrolling and panning.
        Navigation: {
          enable: true,
          panning: true,
          zooming: 10
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
          Log.write("centering");
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
//load JSON data.
      ht.loadJSON(json);
//compute positions and plot.
      ht.refresh();

    });
}

var activeLink = function (bookname) {
  var linkList = document.querySelectorAll("a");
  for (var i = 0; i < linkList.length; i++) {
    linkList[i].removeAttribute('class');
    if (linkList[i].getAttribute('href') === '#' + bookname) {
      linkList[i].className = 'active';
    }
  }
};

document.querySelector("#nav")
  .addEventListener('click', function (e) {
    var bookname = e.target.href.split('#')[1] || 'beginning-html';
    activeLink(bookname);
    init(bookname);
  }, false);


window.onload = function () {
  var bookname = location.hash.slice(1) || 'beginning-html';
  activeLink(bookname);
  init(bookname);
};
