var timeoutID;
var cats;
var purchases;

function setup() {
    document.getElementById("theButton").addEventListener("click", addCategory, true);
    document.getElementById("purchaseButton").addEventListener("click", addPurchase, true);

    cat_poller();
    purchases_poller();
}

function makeReq(method, target, retCode, action, data) {
    var httpRequest = new XMLHttpRequest();

    if (!httpRequest) {
        alert('Cannot create an XMLHTTP instance');
        return false;
    }
    httpRequest.onreadystatechange = makeHandler(httpRequest, retCode, action);
    httpRequest.open(method, target);

    if (data) {
        httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        httpRequest.send(data);
    } else {
        httpRequest.send();
    }
}

function makeHandler(httpRequest, retCode, action) {
    function handler() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === retCode) {
                console.log("response text:  " + httpRequest.responseText);
                action(httpRequest.responseText);
            } else {
                alert("There was a problem, refresh the page");
            }
        }
    }
    return handler;
}

function addCategory() {
    var newCat = document.getElementById("newCat").value
    var budget = document.getElementById("budget").value
    var data;
    data = "name=" + newCat + "&budget=" + budget;
    window.clearTimeout(timeoutID);
    makeReq("POST", "/cats", 201, cat_poller, data);
    document.getElementById("newCat").value = "New Category";
}

function addPurchase() {
    var purchaseName = document.getElementById("purchaseName").value
    var purchaseAmount = document.getElementById("purchaseAmount").value
    var cat = document.getElementById("cat").value
    var date = document.getElementById("date").value

    var data;
    data = "name=" + purchaseName + "&purchaseAmount=" + purchaseAmount + "&cat=" + cat + "&date=" + date;
    window.clearTimeout(timeoutID);
    makeReq("POST", "/purchases", 201, purchases_poller, data);
    document.getElementById("newCat").value = "New Purchase";
}

function cat_poller() {
    makeReq("GET", "/cats", 200, cat_repopulate);
}

function purchases_poller() {
    makeReq("GET", "/purchases", 200, purchase_repopulate);
}

function deleteCategory(taskID) {
    makeReq("DELETE", "/cats/" + taskID, 204, cat_poller);
}

function deletePurchase(taskID) {
    makeReq("DELETE", "/purchases/" + taskID, 204, purchases_poller);
}

//functions for populating
function addCell(row, text) {
    var newCell = row.insertCell();
    var newText = document.createTextNode(text);
    newCell.appendChild(newText);
}

function addRemainingCell(row, text) {
    var newCell = row.insertCell();
    newCell.className = 'remaining';
    var newText = document.createTextNode(text);
    newCell.appendChild(newText);
}

function cat_repopulate(responseText) {
    cats = JSON.parse(responseText);
    console.log("cats: ", cats);
    var tab = document.getElementById("theTable");
    var newRow, newCell, t, task, newButton, newDelF;

    while (tab.rows.length > 0) {
        tab.deleteRow(0);
    }

    newRow = tab.insertRow();
    addCell(newRow, "Category");
    addCell(newRow, "Budget");
    addCell(newRow, "Remaining");
    console.log("cats: ", cats);
    for (c in cats) {
        newRow = tab.insertRow();
        addCell(newRow, cats[c].name);
        addCell(newRow, '$' + cats[c].budget);
        addRemainingCell(newRow, "");

        newCell = newRow.insertCell();
        newButton = document.createElement("input");
        newButton.type = "button";
        newButton.value = "Delete " + cats[c].name;
        (function (_c) {
            newButton.addEventListener("click", function () {
                deleteCategory(cats[_c].cat_id);
            });
        })(c);
        newCell.appendChild(newButton);
    }
    budget();
}

function purchase_repopulate(responseText) {
    purchases = JSON.parse(responseText);
    console.log("purchases: ", purchases);
    var tab = document.getElementById("purchaseTable");
    var newRow, newCell, t, task, newButton, newDelF;

    while (tab.rows.length > 0) {
        tab.deleteRow(0);
    }

    newRow = tab.insertRow();
    addCell(newRow, "Item");
    addCell(newRow, "Amount");
    addCell(newRow, "Category");
    addCell(newRow, "Date");
    console.log("purchases now: ", purchases);
    for (p in purchases) {
        newRow = tab.insertRow();
        addCell(newRow, purchases[p].name);
        addCell(newRow, '$' + purchases[p].purchaseAmount);
        addCell(newRow, purchases[p].cat);
        addCell(newRow, purchases[p].date);

        newCell = newRow.insertCell();
        newButton = document.createElement("input");
        newButton.type = "button";
        newButton.value = "Delete " + purchases[p].name;
        (function (_p) {
            newButton.addEventListener("click", function () {
                deletePurchase(purchases[_p].purchase_id);
            });
        })(p);
        newCell.appendChild(newButton);
    }
    budget();
}

function budget() {
    if (typeof cats === undefined) {
        return;
    }
    if (typeof purchases === undefined) {
        return;
    }
    var i = 0;
    var catNames = [];
    cats.forEach(function (e) {
        e.remaining = e.budget;
        if (purchases) {
            purchases.map(x => e.remaining = x.cat === e.name ? e.remaining -= x.purchaseAmount : e.remaining);
        }
        document.querySelectorAll(".remaining")[i++].innerHTML = '$' + e.remaining;
        catNames.push(e.name);
    });
    var otherSpending = 0;
    if (purchases) {
        purchases.map(x => otherSpending = catNames.indexOf(x.cat) === -1 ? otherSpending += x.purchaseAmount : otherSpending);
    }
    document.getElementById("otherSpending").innerHTML = "Other Spending: $" + otherSpending;
}

// setup load event
window.addEventListener("load", setup, true);