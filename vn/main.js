var objPayloadDemo = {
            "number": {
                "value": ""
            },
            "name": {
                "value": "Dynamic Test Account"
            },
            "mainAddress": {
                "value": {
                    "addressLine1": {
                        "value": "address line 1"
                    },
                    "addressLine2": {
                        "value": "address line 2"
                    },
                    "addressLine3": {
                        "value": "address line 3"
                    },
                    "postalCode": {
                        "value": "address line 1"
                    },
                    "city": {
                        "value": "city"
                    },
                    "county": {
                        "value": "county"
                    },
                    "country": {
                        "value": "country"
                    }
                }
            },
            "mainContact": {
                "value": {
                    "email": {
                        "value": "email"
                    },
                    "web": {
                        "value": "web"
                    },
                    "phone1": {
                        "value": "123123123"
                    },
                    "phone2": {
                        "value": "123123123"
                    },
                    "fax": {
                        "value": "666666"
                    }
                }
            }
        }
var schemaDemo ="Number:Value,string,Name:Value,string,MainAddress:Value:AddressLine1:Value,string,MainAddress:Value:AddressLine2:Value,string,MainAddress:Value:AddressLine3:Value,string,MainAddress:Value:PostalCode:Value,string,MainAddress:Value:City:Value,string,MainAddress:Value:County:Value,string,MainAddress:Value:Country:Value,string,MainContact:Value:Email:Value,string,MainContact:Value:Web:Value,string,MainContact:Value:Phone1:Value,string,MainContact:Value:Phone2:Value,string";
var fieldsMetadata=[];
var f2 = [];
var fieldDelimiter =":";
function buildList(object, path,result) {
    result =result || [];
    path = path || [];
    Object.keys(object).forEach(function (k) {       
        if (object[k] && typeof object[k] === 'object') {
            result =result.concat(buildList(object[k], path.concat(k)));
        }else{ 
            var text = path.concat(k).join(fieldDelimiter);
           // console.log(text);
            result.push({
                fieldName: text,
                fieldType: typeof(object[k]) 
            });
        }
    });
    return result;
}

function onLoad(){
  //  console.log("onLoad");
    if (sessionStorage.getItem("PopulateDemoData") && sessionStorage.getItem("PopulateDemoData") !=="false") {
        document.getElementById("txtPayload").value = JSON.stringify(objPayloadDemo);
        document.getElementById("txtSchema").value = schemaDemo;

        document.getElementById("cbPopulateDemoData").checked =true;// = sessionStorage.getItem("PopulateDemoData");        
    }
}
function onPopulateDemoData(e){
    sessionStorage.setItem("PopulateDemoData", e.checked);
    onLoad();
}

function setSchemaValidationMsg(text=""){
    var control = document.getElementById("txtSchemaValidationMsg");
    control.textContent =text;
}
function setPayloadValidationMsg(text=""){
    var control = document.getElementById("txtPayloadValidationMsg");
    control.textContent =text;
}

function onSchemaChange(e){
    fieldsMetadata=[];
   // console.log("Schema has been changed!!!");
    var eConfig =document.getElementById("txtSchema").value;
    var fields = eConfig.split(',');   
   f2 = [];
    fields.forEach(function(e,index,array){if(!(index % 2))
        {
            fieldsMetadata.push({"fieldName":e, "fieldType": array[index+1]});
            f2.push(e);
        }
    });
    var msg= "Found fields: "+ fieldsMetadata.length;
    setSchemaValidationMsg(msg); 
    populateFieldsTable("tbSchemaFieldsBody",fieldsMetadata); 
}

function populateFieldsTable(tableId,listOfFields, schemaFieldList){
    var tableRef = document.getElementById(tableId);
    tableRef.innerHTML = "";
    listOfFields.forEach((element,index) => {
        var newRow = tableRef.insertRow();
        var isFieldExistedInSchema =0;
        if(schemaFieldList !=null){
            isFieldExistedInSchema= schemaFieldList.indexOf(element.fieldName);
            if(isFieldExistedInSchema <0)
            {
                newRow.classList.add("errorTableRow");
                newRow.title=`Error: Field ${element} is missing in schema (`
            }else{
                newRow.classList.add("okTableRow");
                newRow.title=`Field ${element} is existing in schema!!!`
            }
        }
        
        var newCellCounter = newRow.insertCell();
        var newCounterText = document.createTextNode(index);

        var newCell = newRow.insertCell();
        var newText = document.createTextNode(element.fieldName);

        var newCellType = newRow.insertCell();
        //TODO: fix field type populating
        var newText1 = document.createTextNode(element.fieldType);

        newCellCounter.appendChild(newCounterText);
        newCell.appendChild(newText);
        newCellType.appendChild(newText1);
    });  
}

function onCalculate(e){
    onSchemaChange();
    onPayloadChange(); 
}

function onPayloadChange(){
   // console.log("Payload has been changed!!!");
    var payloadJson =document.getElementById("txtPayload").value;
    var objPayload =JSON.parse(payloadJson);
    var payloadSchema = buildList(objPayload);
    if(payloadSchema.length !==fieldsMetadata.length){
        setPayloadValidationMsg(`Count fields of the shema ${fieldsMetadata.length}, Payload: ${payloadSchema.length}`);
    }
    populateFieldsTable("tbPayloadFieldsBody",payloadSchema,f2); 
    //debugger;
    //var el = document.getElementById('jsonPreview');
    //var p = jsonViewer(objPayload, true);
    //el.innerHTML = p
}

function jsonViewer(json, collapsible=false) {
    var TEMPLATES = {
        item: '<div class="json__item"><div class="json__key">%KEY%</div><div class="json__value json__value--%TYPE%">%VALUE%</div></div>',
        itemCollapsible: '<label class="json__item json__item--collapsible"><input type="checkbox" class="json__toggle"/><div class="json__key">%KEY%</div><div class="json__value json__value--type-%TYPE%">%VALUE%</div>%CHILDREN%</label>',
        itemCollapsibleOpen: '<label class="json__item json__item--collapsible"><input type="checkbox" checked class="json__toggle"/><div class="json__key">%KEY%</div><div class="json__value json__value--type-%TYPE%">%VALUE%</div>%CHILDREN%</label>'
    };

    function createItem(key, value, type){
        var element = TEMPLATES.item.replace('%KEY%', key);

        if(type == 'string') {
            element = element.replace('%VALUE%', '"' + value + '"');
        } else {
            element = element.replace('%VALUE%', value);
        }

        element = element.replace('%TYPE%', type);

        return element;
    }

    function createCollapsibleItem(key, value, type, children){
        var tpl = 'itemCollapsible';
        
        if(collapsible) {
            tpl = 'itemCollapsibleOpen';
        }
        
        var element = TEMPLATES[tpl].replace('%KEY%', key);

        element = element.replace('%VALUE%', type);
        element = element.replace('%TYPE%', type);
        element = element.replace('%CHILDREN%', children);

        return element;
    }

    function handleChildren(key, value, type) {
        var html = '';

        for(var item in value) { 
            var _key = item,
                _val = value[item];

            html += handleItem(_key, _val);
        }

        return createCollapsibleItem(key, value, type, html);
    }

    function handleItem(key, value) {
        var type = typeof value;

        if(typeof value === 'object') {        
            return handleChildren(key, value, type);
        }

        return createItem(key, value, type);
    }

    function parseObject(obj) {
        _result = '<div class="json">';

        for(var item in obj) { 
            var key = item,
                value = obj[item];

            _result += handleItem(key, value);
        }

        _result += '</div>';

        return _result;
    }
    
    return parseObject(json);
};

function onClickShowModalDialog(){
    debugger;
    $('#exampleModal').modal('show');
    
}


