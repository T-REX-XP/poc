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
}

function renderUi(entities) {
  let dropdown = $('#locality-dropdown');
  let menu = $('#tabs');
  dropdown.empty();

  dropdown.append('<option selected="true" disabled>Choose entity...</option>');
  entities.forEach(element => {
    var option = $('<option></option>').attr('value', element).text(element + " (" + window.resultByEntity[element].length + ")");
    dropdown.append(option);
    var tab = $('<li class="nav-item"></li>').append($('<a id="a' + element + '" class="nav-link" href="#" onclick="onSelectedEntityChange(this.text,this)"></a>').text(element));
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
  renderTable(e);
}
function renderTable(entName) {
  var data = window.resultByEntity[entName];
  var columns = Object.keys(data[0]);
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
      tBody.append('<tr>' + '<th scope="row">' + npp + '</th>' + text + '</tr>');
    }
    var insertTable = function (table) {
      tBody.append(table);
    }
    generateRow(record, columns, appendText, insertTable);
  });
  $('#spinner').hide();
}

function generateRow(record, columns, appendText, insertTable) {
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
          vals.push('<span class="badge badge-primary">'+k+ '</span>'); //
        });
        val = vals.join(", \n")
      } else if (val !=null && val[0] !=null ) {

        var vals = [];
        console.log(val);
        keys = Object.keys(val[0]);
        /* val.forEach(d=>{
           keys.forEach(f=>{
             vals.push(f+": "+d[f]);
           })
         });*/
        table.push(val);
      }
    }

    if (typeof val == "string" && val.includes('://')) {
      val = "<a href=" + val + ">" + val + "</a>";
    }else if(val !=null && !Array.isArray(val)){
      val = '<span class="badge badge-primary">'+val+ '</span>'; //
    }
    else if(val ==null){
      val = '<span class="badge badge-danger">'+val+ '</span>'; //
    }
    
    result.push('<td>' + val + '</td>');
  });
  /*if(table.length >0){
    return insertTable( generateInnerTable(table[0],keys));
  }*/

  return appendText(result.join(""));
}

function generateInnerTable(data) {
  var table = $('<table class="table"></table>');
  var tHeader = $('<thead class=""></thead>').append("<tr></tr>");
  var keys = Object.keys(data[0]);
  keys.forEach(k => {
    tHeader.append('<td class="sticky-top" scope="col">' + k + '</td>');
  });
  table.append(tHeader);
  var tBody = $('<tbody class=""></tbody>');
  data.forEach(r => {
    debugger;
    keys.forEach(f => {
      tBody.append('<td>' + '<th scope="row">' + r[f] + '</th>' + "" + '</td>');
    });

  });
  table.append(tBody);
  return table;
}