function LoadReport() {
  console.log("---Report loaded: " + report.length);
  var groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };
  console.log("grouping...");
  let summary = $('#summary');

  window.resultByEntity = groupBy(report, "EntityLogicalName");
  var entities = Object.keys(window.resultByEntity);
  summary.text("Entities count: " + entities.length + ", Total records count: " + report.length);
  console.log("Found entities: " + Object.keys(window.resultByEntity).join(", "));
  renderUi(Object.keys(window.resultByEntity));
  renderAvailableCols(window.resultByEntity[entities[0]][0]);
}

function renderAvailableCols(obj) {
  window.availableColumns = Object.keys(obj);
  let columns = $('#columns');
  window.availableColumns.forEach(element => {
    var tab = $('<li class="nav-item"></li>')
      .append($('<input type="checkbox" class="fieldName" checked id="' + element + '" name="' + element + '" onChange="onColumnChange(this.checked,this.id)">' + element + '</input>'));
    columns.append(tab);
  });
}

function onColumnChange(val, name) {
  if (val) {
    window.availableColumns.push(name);
  } else {
    window.availableColumns = window.availableColumns.filter(function (x) {
      return x != name;
    });
  }
  if (window.prevActive) {
    renderTable(window.prevEnt);
  }
}

function renderUi(entities) {
  let dropdown = $('#locality-dropdown');
  let menu = $('#tabs');
  dropdown.empty();

  dropdown.append('<option selected="true" disabled>Choose entity...</option>');
  entities.forEach(element => {
    var option = $('<option></option>').attr('value', element).text(element + " (" + window.resultByEntity[element].length + ")");
    dropdown.append(option);
    var tab = $('<li class="nav-item"></li>').append($('<a id="' + element + '" class="nav-link" href="#" onclick="onSelectedEntityChange(this.id,this)"></a>').text(element + " (" + window.resultByEntity[element].length + ')'));
    menu.append(tab);
  });
  dropdown.prop('selectedIndex', 0);
}

function onSelectedEntityChange(e, a) {
  console.log("Chosen: " + e);
  $('#spinner').show();

  $('#' + window.prevActive).removeClass("active")
  a.classList.add("active");
  window.prevActive = a.id;
  window.prevEnt = e;
  renderTable(e);
}
function renderTable(entName) {
  var data = window.resultByEntity[entName];
  var columns = Object.keys(data[0]);
  columns = columns.filter(x => {
    return window.availableColumns.includes(x);
  });
  let tHead = $('#resultTable > thead > tr');
  tHead.empty();
  tHead.append('<td class="sticky-top" scope="col">#</td>');
  columns.forEach(element => {
    tHead.append('<td class="sticky-top" scope="col">' + element + '</td>');
  });

  let tBody = $('#resultTable > tbody');
  tBody.empty();
  data.forEach((record, index) => {
    var npp = index + 1;
    var appendText = function (text) {
      var tr = $('<tr>' + '<th scope="row">' + npp + '</th>' + text + '</tr>');
      tBody.append(tr);
    }
    generateRow(record, columns, appendText);
  });
  $('#spinner').hide();
}

function generateRow(record, columns, appendText) {
  var result = [];
  var table = [];
  var keys = [];
  columns.forEach((fName, index) => {
    var val = record[fName];
    console.log(typeof val);
    if (val && Array.isArray(val)) {
      keys = Object.keys(val);
      if (typeof val[keys[0]] !== "object") {
        var vals = [];
        val.forEach(k => {
          vals.push('<span class="badge badge-primary">' + k + '</span>'); //
        });
        val = vals.join(", \n")
      } else if (val != null && val[0] != null) {
        var vals = [];
        console.log(val);
        keys = Object.keys(val[0]);
        table.push(val);
        val = generateInnerTable(val, keys).html();
      }
    }
    //is link
    if (typeof val == "string" && val.includes('://')) { } else if (val != null && !Array.isArray(val)) { }
    //is null
    else if (val == null) {
      val = '<span class="badge badge-danger">' + val + '</span>'; //
    }

    result.push('<td>' + val + '</td>');
  });
  appendText(result.join(""));
}

function generateInnerTableHeader(table, keys) {
  var tHeader = $('<thead class="thead-light tableHeaderMetadata"></thead>');
  keys.forEach(k => {
    tHeader.append('<td scope="col">' + k + '</td>');
  });
  table.append(tHeader);
}

function generateInnerTable(data) {
  var cont = $('<div></div>');
  var table = $('<table id="tbMetadata" class="table table-striped tableMetadata"></table>');
  var keys = Object.keys(data[0]).sort();
  generateInnerTableHeader(table, keys);

  var tBody = $('<tbody></tbody>');
  try {
    data.forEach(r => {
      var row = $('<tr></tr>');
      if (r.InternalName == "documentbody" || r.InternalName == "body") {
        if (r.Value) {
          r.Value = '<span class="badge badge-primary">documentbnody' + '</span>';
        } else {
          r.Value = '<span class="badge badge-danger">null' + '</span>';
        }
      }
      else if (r.InternalName == "entityimage") {
        if (r.Value) {
          r.Value = '<span class="badge badge-primary">entiyimage' + '</span>';
        } else {
          r.Value = '<span class="badge badge-danger">null' + '</span>';
        }
      }

      keys.forEach(f => {
        row.append('<th>' + r[f] + '</th>');
      });
      tBody.append(row);
    });
  }
  catch (e) {
    console.log(e);
  }


  table.append(tBody);
  cont.append(table);
  return cont;
}

function selectAll() {
  var entities = Object.keys(window.resultByEntity);
  var columns = Object.keys(window.resultByEntity[entities[0]][0]);
  window.availableColumns = columns;
  if (window.prevActive) {
    renderTable(window.prevEnt);
  }
}

function deselectAll() {
}

function selectColumns(columns) {
  window.availableColumns = window.availableColumns.filter(function (x) {
    return columns.includes(x);
  });
  if (window.prevActive) {
    renderTable(window.prevEnt);
  }
}