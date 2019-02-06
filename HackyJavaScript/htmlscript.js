// Global constants
const DOCKED_IFRAME_ID = "_tableViewFrameDocked";
const UNDOCKED_IFRAME_ID = "_tableViewFrameUnDocked";


/*
 * Converts the element's innerHTML to its innerText
 */  
function innerTextToHtml(element) {
    var text = element.innerText;
    element.innerHTML = text;
}


/*
 * Is this string an HTML element? 
 */ 
function isHtmlString(s) {
    return s.startsWith("<") && s.endsWith(">");
}


function getTableFrom(iframeElement) {
    if (iframeElement === null) {
        return null;
    }
    var parentDoc = iframeElement.contentDocument;
    // try by ID
    const id = "_reviewqueuelist_ctl00_itemList_listTable";
    var element = parentDoc.getElementById(id);
    if (element !== undefined && element !== null) {
        return element;
    }

    // try to find by tag/class name
    const tableClass = "itemTable lock-header";
    var tables = parentDoc.getElementsByTagName("table");
    var tableArr = Array.from(tables);
    targetTables = tableArr.filter(el => el.className === tableClass);
    if (targetTables.length === 1) {
        return targetTables[0];
    }

    // return null if not found
    return null;
}


function getChildTableByIFrameId(iFrameID) {
    var iFrameTableEl = top.document.getElementById(iFrameID);
    var table = getTableFrom(iFrameTableEl);
    return table;
}


/*
 * Search for review queue list table,
 * returning null if not found
 */  
function getDockedTable() {
    return getChildTableByIFrameId(DOCKED_IFRAME_ID);
}


function getUndockedTable() {
    // find iFrame
    return getChildTableByIFrameId(UNDOCKED_IFRAME_ID);
}


/*
 * Transforms the table's cells into HTML if 
 * the innerText property looks like HTML
 */
function transformIntoHtml(tbl) {
    if (tbl === null) {
        //console.log("Table is null");
        return;
    }

    if (tbl.tBodies.length !== 1) {
        console.log("Either zero or more than one tBodies. Probably found wrong table?");
        return;
    }

    // iterate through cells, applying the transformation
    var tBody = tbl.tBodies[0];
    for (var i = 0; i < tBody.children.length; i++) {
        var row = tBody.children[i];
        for (var j = 0; j < row.children.length; j++) {
            var col = row.children[j];
            var textInner = col.innerText;
            if (isMachOneField(textInner)) {
                col.innerHTML = generateMachOneHtml(textInner);
            }
        }
    }
}

/*
 * MachOne Functions
 */
function isMachOneField(data) {
    // validating data input
    if (!data) {
        return false;
    }
    else {
        try {
            data = data.replace(/&quot;/g, '"');
            var input = JSON.parse(data);
            if (!input.DocumentID) {
                throw "Incorrect input json";
            }
            return true;
        }
        catch {
            return false;
        }
    }
}



function generateMachOneHtml(data) {

    //conversion of json string into object

    data = data.replace(/&quot;/g, '"');
    var input = JSON.parse(data);

    // setup of content

    var id = `${input.DestinationFieldID}${input.DocumentID}`;
    var customPageGuid = `83fbdba9-bbc9-4007-bdfb-233631e2c743`;
    var customPageURL = `/Relativity/custompages/${customPageGuid}/api/FieldSave/`;
    var fieldHtmlID = `"#${id}"`;

    function getChoices() {
        if (input.Choices === "") { return "" };
        let choices = "[";
        for (let i = 0; i < input.Choices.length; i++) {
            choices += `{"name":"${input.Choices[i].Name}", "artifactID": "${input.Choices[i].ArtifactID}"}`;
            if (i !== input.Choices.length - 1) {
                choices += ","
            }
        }
        choices += "]";
        return choices;
    };

    var ajaxCall = `var postData = { workspaceID:  ${input.WorkspaceID}, documentID: ${input.DocumentID}, fieldType: ${input.FieldType}, destinationFieldID: ${input.DestinationFieldID}, sourceFieldID:${input.SourceFieldID}, value: n , choices: ${getChoices()} };
                            $.ajax({ type: "POST", url: "${customPageURL}", data: JSON.stringify(postData), contentType: "application/json" }).done(function() { $(${fieldHtmlID}).css("border","2px solid #00d103");}).fail(function() { $(${fieldHtmlID}).css("border","2px solid #cc0000");});`;
    var onfocus = `$(${fieldHtmlID}).css("border","2px solid #0003cc");`

    var onBlurYesNo = `var n=$(${fieldHtmlID}).is(":checked"); ${ajaxCall} $(${fieldHtmlID}).css("border","2px solid #efaa21");`;
    var onBlur = `(function(e) { var n=$(${fieldHtmlID}).val(); ${ajaxCall} $(${fieldHtmlID}).css("border","2px solid #efaa21"); })(event)`;

    var keydown = `(function (e) {   if(e.which === 38 || e.which === 40 || e.which === 39 || e.which === 37|| e.which === 69 || e.which === 190 || e.which === 32 || e.which === 187) {e.preventDefault();}    })(event)`;
    var onKeyUp = `(function(e){if(e.which===38){var cellIndex=$(${fieldHtmlID}).parent().index();var cellAbove=$(${fieldHtmlID}).parent().parent().prev("tr").children("td:nth-child("+(cellIndex+1)+")");cellAbove.find("input,select, .multichoice").focus();}else if(e.which===39){var nextEl=$(${fieldHtmlID}).parent().next();var tries=0;while(nextEl.find("input,select, .multichoice").length===0||tries>4){nextEl=nextEl.next();tries++;}nextEl.find("input,select, .multichoice").focus();}else if(e.which===37){debugger;var prevEl=$(${fieldHtmlID}).parent().prevUntil("td input,select,.multichoice").focus();}else if(e.which===40){var cellIndex=$(${fieldHtmlID}).parent().index();var cellBelow=$(${fieldHtmlID}).parent().parent().next("tr").children("td:nth-child("+(cellIndex+1)+")");cellBelow.find("input,select, .multichoice ").focus();}})(event)`;

    function getText() { if (input.Value === null) { return "" } else { return input.Value } };

    //switch on field type

    switch (input.FieldType) {
        case 0: //fixed length text
        case 4: //long text
            return `<input id='${id}' type='text' onfocus='${onfocus}' onblur='${onBlur}' onkeyup='${onKeyUp}' autocomplete = 'off'  value='${getText()}' style='width:-webkit-fill-available;' data-toggle='tooltip'  />`;
        case 1: //whole number
            return `<input id='${id}' type='number'  onfocus='${onfocus}' onblur='${onBlur}' onkeyup='${onKeyUp}' onkeydown='${keydown}'   autocomplete = 'off' style="width:-webkit-fill-available;" value='${input.Value}' />`;
        case 2: //date
            return `<input id='${id}' type='datetime-local' onfocus='${onfocus}' onblur='${onBlur}' onkeyup='${onKeyUp}' onkeydown='${keydown}' autocomplete = 'off' style="width:-webkit-fill-available;"  value='${input.Value}'/>`;
        case 3: //yes / no
            return `<input id='${id}' type='checkbox' onfocus='${onfocus}' onblur='${onBlurYesNo}' onkeyup='${onKeyUp}' autocomplete = 'off' style='width:97%;'/>`;

        case 5: //single choice
            function setSelected(artifactID) {
                if (parseInt(input.Value) === artifactID) { return "selected" } else { return "" };
            };
            var choiceOptions = "<option selected>Select Option:</option>";
            for (let i = 0; i < input.Choices.length; i++) {
                choiceOptions += `<option value="${input.Choices[i].ArtifactID}" ${setSelected(input.Choices[i].ArtifactID)}>${input.Choices[i].Name}</option>`;
            }
            return `<select id='${id}' onfocus='${onfocus}' onblur='${onBlur}' onkeyup='${onKeyUp}' onkeydown='${keydown}' style="width:-webkit-fill-available; padding:2px;">${choiceOptions}</select>`;

        case 8: // multiple choice
            var onclick = `(function (e){ var expanded=$('#${id} .checkbox').css('display'); if(expanded === 'none'){     $('#${id} .checkbox').css('display', 'block');} else { $('#${id} .checkbox').css('display', 'none'); }   })(event)`;
            var onBlurMulti = `(function(e){ if (e.relatedTarget.className !="multichoice ${id}"){  $("#${id} .checkbox").css("display", "none");           var children=$("#${id} .checkbox").children(); var n = "";   for(let i=0; i< children.length; i++){  if(children[i].childNodes[1].checked){ if(i != 0 && n != ""){n +=";";}    var value = children[i].childNodes[1].value; n += value  } }          ${ajaxCall}$(${fieldHtmlID}).css("border", "2px solid #efaa21");}})(event)`;
            var keyDownMulti = `(function (e) {   if(e.which === 13) { var expanded=$("#${id} .checkbox").css("display"); if(expanded === "none"){     $("#${id} .checkbox").css("display", "block");} else { $("#${id} .checkbox").css("display", "none"); } } else{e.preventDefault();}   })(event)`;

            function setChecked(artifactID) {
                var str = String(input.Value);
                if (str.includes(`${artifactID}`)) { return "checked" } else { return "" };
            }


            var multiChoiceOptions = "";
            for (let i = 0; i < input.Choices.length; i++) {
                multiChoiceOptions += `<label class="multichoice ${id}" style="display: block; margin:0px 0px 5px 8px"> <input class="multichoice ${id}" onfocus="" onblur='${onBlurMulti}' style="margin-right: 5px;" type="checkbox" ${setChecked(input.Choices[i].ArtifactID)} value="${input.Choices[i].ArtifactID}"/>${input.Choices[i].Name}</label>`;
                //value="${input.Choices.ArtifactID}"
            }
            return `<div tabindex="0"  onfocus='${onfocus}' onblur='${onBlurMulti}'  onkeyup='${onKeyUp}' onkeydown='${keyDownMulti}' class='multichoice ${id}' id='${id}'    style="width: -webkit-fill-available; font-size:13.3333px; max-height:200px; overflow:auto; color:black; background-color:white;  line-height:normal;  border: solid rgb(169, 169, 169);  border-width:  1px;" ><p style="margin: 2.1px; -webkit-appearance: menulist;" onclick="${onclick}">Select Options:</p><div id='${id}' class="checkbox" style="display: none; margin-top: 8px;"">${multiChoiceOptions}</div></div>`;
    }





}



/*
 * Renders plaintext as proper HTML
 */ 
function applyTransformToDockedAndUndocked() {
    var dockedTbl = getDockedTable();
    var undockedTbl = getUndockedTable();
    transformIntoHtml(dockedTbl);
    transformIntoHtml(undockedTbl);
}


function attachListenerTo(iFrame) {
    if (iFrame !== null)
        iFrame.addEventListener("load", applyTransformToDockedAndUndocked);
}


function hackyPiehStartup() {
    console.log("this is a message");
    dockedFrame = top.document.getElementById(DOCKED_IFRAME_ID);
    undockedFrame = top.document.getElementById(UNDOCKED_IFRAME_ID);
    attachListenerTo(dockedFrame);
    attachListenerTo(undockedFrame);
    applyTransformToDockedAndUndocked();
}

hackyPiehStartup();
console.log("this is another message");