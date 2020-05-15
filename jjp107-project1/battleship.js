var row_arr = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
var col_arr = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
var p1_hitArr = ["", "", "", "", "", "", "", "", "", "", "", ""];
var p2_hitArr = ["", "", "", "", "", "", "", "", "", "", "", ""];

var p1_shipLocations = [""]; // Contains ship placement locations for player 1
var player1_Name = prompt("Enter Player 1's Name: ", 'Player 1');
var ship_Coordinates = prompt(`${player1_Name}, enter coordinates: `, "A:A1-A5;B:B6-E6; S:H3-J3");
var matchCoordinates = ship_Coordinates.match(/[ASB]?[(:]?([A-J]\d)-([A-J]\d)?[)]?[;]?/g);
p1_shipLocations = getShipLocations(matchCoordinates, 1);
if (p1_shipLocations == -1) {
    alert(`${player1_Name}, your ship coordinates are invalid, Please restart`);
    exit();
}
var p2_shipLocations = [""]; // Contains ship placement locations for player 2
var player2_Name = prompt("Enter Player 2's Name: ", 'Player 2');
while (player1_Name == player2_Name) {
    player2_Name = prompt("Enter Player 2's Name: \n Names shall be different", 'Player 2');
}
ship_Coordinates = prompt(`${player2_Name}, enter coordinates: `, "A:A1-A5;B:B6-E6; S:H3-J3");
matchCoordinates = ship_Coordinates.match(/[ASB]?[(:]?([A-J]\d)-([A-J]\d)?[)]?[;]?/g);
p2_shipLocations = getShipLocations(matchCoordinates, 2);
if (p2_shipLocations == -1) {
    alert(`${player2_Name}, your ship coordinates are invalid, Please restart`);
    exit();
}

var p1_shipTable = "shipTable_p1";
var player1_gridName = "p1_grid";
var p2_shipTable = "shipTable_p2";
var player2_gridName = "p2_grid";
var player_turn = player1_gridName;
var score_board = document.getElementById("top10_scores");
score_board.setAttribute("class", "hideGrid");

alert(`Let's Play Battleship, ${player1_Name} it's your turn! \n\n Click OK to begin`);

createGrid(p1_shipTable, player1_gridName, false);
createGrid("hiddenTable_p1", player1_gridName, false);
createGrid(p2_shipTable, player2_gridName, false);
createGrid("hiddenTable_p2", player2_gridName, true);
placeHiddenShips(p1_shipLocations, 1); // Place Ships on Table
placeHiddenShips(p2_shipLocations, 2); // Place Ships on Table

/**
 * Creates Grid for player(s), assigns them visible and hidden.
 * @param {*} id id from HTML
 * @param {*} grid id from HTML
 * @param {*} hideGrid boolean, value to hide/show grid.
 */
function createGrid(id, grid, hideGrid) {
    const rowCount = 10;
    const colCount = 10;
    var i, j, allowClicks = 0;
    if (id == "shipTable_p1" || id == "shipTable_p2") {
        allowClicks = 1;
    }
    var table = document.createElement("table");
    table.id = id;

    for (i = 0; i < rowCount; i++) {
        var row = table.insertRow(i);
        for (j = 0; j < colCount; j++) {
            var td = document.createElement("td");
            td.setAttribute("id", col_arr[j] + row_arr[i] + "_" + id);
            td.setAttribute("class", "gridLightBlue");
            if (allowClicks) {
                td.addEventListener("click", function () {
                    shoot(this);
                }, true);
            }
            row.appendChild(td);
        }
    }
    var c = document.getElementById(grid);
    c.appendChild(table);
    if (hideGrid) {
        c.setAttribute("class", "hideGrid");
    }
}

/**
 * Main shoot function, used to target other players ships
 * @param {*} launchMissile location to shoot
 */
function shoot(launchMissile) {
    var visibleTable;
    var hiddenTable;
    var current_location;
    var shipSafety;
    var set_playerTo = 1;
    var game_end = false;

    if (player_turn == player1_gridName) {
        visibleTable = document.getElementById(p1_shipTable);
        hiddenTable = document.getElementById("hiddenTable_p2");
        current_location = p1_shipLocations;
        set_playerTo = 1;
    } else {
        visibleTable = document.getElementById(p2_shipTable);
        hiddenTable = document.getElementById("hiddenTable_p1");
        current_location = p2_shipLocations;
        set_playerTo = 2;
    }

    var exit = false;
    var hitCount = 0;
    for (var j = 0; j < visibleTable.rows.length; j++) {
        if (exit) {
            break;
        }
        for (var i = 0; i < visibleTable.rows[j].cells.length; i++) {
            var hitCell = visibleTable.rows[j].cells[i];
            var maskCell = hiddenTable.rows[j].cells[i];
            var id = col_arr[i] + row_arr[j] + "_" + visibleTable.id;
            if (launchMissile.id == id) {
                var location_index = current_location.indexOf(id);
                if (location_index > -1) {
                    alert('Target Hit');
                    hitCell.setAttribute("class", "gridHitRed");
                    maskCell.setAttribute("class", "gridHitRed");
                    hitCount = hitCount + 2;
                    if (set_playerTo == 1) {
                        p1_hitArr[location_index] = id;
                        shipSafety = p1_hitArr;
                    } else {
                        p2_hitArr[location_index] = id;
                        shipSafety = p2_hitArr;
                    }
                    game_end = shipSafety.indexOf("") == -1;
                    //console.log("inside shoot(), game_end value: ", game_end);
                } else {
                    hitCell.setAttribute("class", "gridMissWhite");
                    maskCell.setAttribute("class", "gridMissWhite");
                    alert('Target Missed');
                }
                exit = true;
                break;
            }
        }
    }

    if (!game_end) {
        var hideGrid = document.getElementById(player_turn);
        hideGrid.setAttribute("class", "hideGrid");
        if (player_turn == player1_gridName) {
            alert(`Click OK to begin ${player2_Name}'s turn.`);
            player_turn = player2_gridName;
        } else {
            alert(`Click OK to begin ${player1_Name}'s turn.`);
            player_turn = player1_gridName;
        }
        var showGrid = document.getElementById(player_turn);
        showGrid.setAttribute("class", "showGrid");
    } else { // Game Ends, hide grids and show scoreboard!
        var p1_grid = document.getElementById(player1_gridName);
        p1_grid.setAttribute("class", "hideGrid");
        var p2_grid = document.getElementById(player2_gridName);
        p2_grid.setAttribute("class", "hideGrid");
        if (player_turn == player1_gridName) {
            // console.log(`${player1_Name} wins!`);
            // console.log("Array Player 1: ", p1_hitArr);
            // console.log("Array Player 2: ", p2_hitArr);
            var get_score = calcScore(p2_hitArr);
            scoreBoard(player1_Name, get_score);
            // console.log("Score: ", get_score);
        } else {
            // console.log(`${player2_Name} wins!`);
            // console.log("Array Player 1: ", p1_hitArr);
            // console.log("Array Player 2: ", p2_hitArr);
            var get_score = calcScore(p1_hitArr);
            scoreBoard(player2_Name, get_score);
            // console.log("Score: ", get_score);
        }
    }

}

/**
 * Calculates Score after the game is finished
 * @param {*} arr The array of loser's ship
 */
function calcScore(arr) {
    var i;
    var get_hit = 0
    var total = 24;
    for (i = 0; i < arr.length; i++) {
        if (arr[i] != "") {
            get_hit = get_hit + 1;
        } else {
            break;
        }
    }
    total = total - (2 * get_hit);

    return total;
}

/**
 * Displays the scoreboard, using local storage also gets previous scores.
 * @param {*} player_name Player name(winner name)
 * @param {*} player_score score of the winning player
 */
function scoreBoard(player_name, player_score) {
    if (localStorage.getItem("past_perfect_scores") == null || localStorage.getItem("past_scores") == null) {
        var score_array = [];
        localStorage.setItem("past_scores", JSON.stringify(score_array));
        localStorage.setItem("past_perfect_scores", 0);
    }
    var insert_score = JSON.parse(localStorage.getItem("past_scores"));
    var insert_perfect_score = localStorage.getItem("past_perfect_scores");
    if (insert_perfect_score < 10) {
        var entry = JSON.parse('{ "name": ' + '"' + player_name + '", "score": ' + player_score + "}");
        if (player_score == 24) {
            var new_score = parseInt(insert_perfect_score);
            new_score += 1;
            localStorage.setItem("past_perfect_scores", new_score);
        }
        insert_score.push(entry);
        insert_score.sort(function (first, second) {
            return parseInt(second.score) - parseInt(first.score);
        });
        if (insert_score.length > 10) {
            insert_score.pop();
        }
        localStorage.setItem("past_scores", JSON.stringify(insert_score));
    }
    var count = 0;
    insert_score.forEach(function (item) {
        var name = document.getElementById(count + "_player-name");
        var score = document.getElementById(count + "_player-score");
        name.textContent = item.name;
        score.textContent = item.score;
        count++;
    });
    alert(`${player_name} WIN'S :)`);
    score_board.setAttribute("class", "showGrid");
}
/**
 *  This also checks for the correct string(ship placement) from user input.
 * @param {*} loc_arr Input string from user.
 * @returns An Array containing ship locations.
 */
function getShipLocations(loc_arr, player_no) {
    var ret = ["", "", "", "", "", "", "", "", "", "", "", ""]; // Returns this array
    var first_ship = loc_arr[0].substr(0, 1);
    //console.log("First Ship: ", first_ship);
    var second_ship = loc_arr[1].substr(0, 1);
    //console.log("Second Ship: ", second_ship);
    var third_ship = loc_arr[2].substr(0, 1);
    //console.log("Third Ship: ", third_ship);

    var first_ship_range = loc_arr[0].substr(2, 5);
    //console.log("First Ship Range", first_ship_range);
    if (first_ship == "A") {
        var num1 = first_ship_range.substr(1, 1);
        //console.log(num1);
        var num2 = first_ship_range.substr(4);
        //console.log(num2);
        var num_t = num2 - num1;
        var alph1 = first_ship_range.substr(0, 1);
        var alph2 = first_ship_range.substr(3, 1);
        //console.log(alph1, alph2);
        var alph_t = alph2.charCodeAt(0) - alph1.charCodeAt(0);
        if (Math.abs(num_t) != 4) {
            //console.log("less than 4");
            if (Math.abs(alph_t) != 4) {
                //console.log(alph_t)
                return -1
            }
        }
    } else if (first_ship == "B") {
        var num1 = first_ship_range.substr(1, 1);
        var num2 = first_ship_range.substr(4);
        var num_t = num2 - num1;
        var alph1 = first_ship_range.substr(0, 1);
        var alph2 = first_ship_range.substr(3, 1);
        var alph_t = alph2.charCodeAt(0) - alph1.charCodeAt(0);
        if (Math.abs(num_t) != 3) {
            if (Math.abs(alph_t) != 3) {
                return -1
            }
        }
    } else if (first_ship == "S") {
        var num1 = first_ship_range.substr(1, 1);
        var num2 = first_ship_range.substr(4);
        var num_t = num2 - num1;
        var alph1 = first_ship_range.substr(0, 1);
        var alph2 = first_ship_range.substr(3, 1);
        var alph_t = alph2.charCodeAt(0) - alph1.charCodeAt(0);
        if (Math.abs(num_t) != 2) {
            if (Math.abs(alph_t) != 2) {
                return -1
            }
        }
    }
    var second_ship_range = loc_arr[1].substr(2, 5);
    //console.log("Second Ship Range", second_ship_range);
    if (second_ship == "A") {
        var num1 = second_ship_range.substr(1, 1);
        //console.log(num1);
        var num2 = second_ship_range.substr(4);
        //console.log(num2);
        var num_t = num2 - num1;
        var alph1 = second_ship_range.substr(0, 1);
        var alph2 = second_ship_range.substr(3, 1);
        //console.log(alph1, alph2);
        var alph_t = alph2.charCodeAt(0) - alph1.charCodeAt(0);
        if (Math.abs(num_t) != 4) {
            //console.log("less than 4");
            if (Math.abs(alph_t) != 4) {
                //console.log(alph_t)
                return -1
            }
        }
    } else if (second_ship == "B") {
        var num1 = second_ship_range.substr(1, 1);
        var num2 = second_ship_range.substr(4);
        var num_t = num2 - num1;
        var alph1 = second_ship_range.substr(0, 1);
        var alph2 = second_ship_range.substr(3, 1);
        var alph_t = alph2.charCodeAt(0) - alph1.charCodeAt(0);
        if (Math.abs(num_t) != 3) {
            if (Math.abs(alph_t) != 3) {
                return -1
            }
        }
    } else if (second_ship == "S") {
        var num1 = second_ship_range.substr(1, 1);
        var num2 = second_ship_range.substr(4);
        var num_t = num2 - num1;
        var alph1 = second_ship_range.substr(0, 1);
        var alph2 = second_ship_range.substr(3, 1);
        var alph_t = alph2.charCodeAt(0) - alph1.charCodeAt(0);
        if (Math.abs(num_t) != 2) {
            if (Math.abs(alph_t) != 2) {
                return -1
            }
        }
    }
    var third_ship_range = loc_arr[2].substr(2, 5);
    //console.log("Third Ship Range", third_ship_range);
    if (third_ship == "A") {
        var num1 = third_ship_range.substr(1, 1);
        //console.log(num1);
        var num2 = third_ship_range.substr(4);
        //console.log(num2);
        var num_t = num2 - num1;
        var alph1 = third_ship_range.substr(0, 1);
        var alph2 = third_ship_range.substr(3, 1);
        //console.log(alph1, alph2);
        var alph_t = alph2.charCodeAt(0) - alph1.charCodeAt(0);
        if (Math.abs(num_t) != 4) {
            //console.log("less than 4");
            if (Math.abs(alph_t) != 4) {
                //console.log(alph_t)
                return -1
            }
        }
    } else if (third_ship == "B") {
        var num1 = third_ship_range.substr(1, 1);
        var num2 = third_ship_range.substr(4);
        var num_t = num2 - num1;
        var alph1 = third_ship_range.substr(0, 1);
        var alph2 = third_ship_range.substr(3, 1);
        var alph_t = alph2.charCodeAt(0) - alph1.charCodeAt(0);
        if (Math.abs(num_t) != 3) {
            if (Math.abs(alph_t) != 3) {
                return -1
            }
        }
    } else if (third_ship == "S") {
        var num1 = third_ship_range.substr(1, 1);
        var num2 = third_ship_range.substr(4);
        var num_t = num2 - num1;
        var alph1 = third_ship_range.substr(0, 1);
        var alph2 = third_ship_range.substr(3, 1);
        var alph_t = alph2.charCodeAt(0) - alph1.charCodeAt(0);
        if (Math.abs(num_t) != 2) {
            if (Math.abs(alph_t) != 2) {
                return -1
            }
        }
    }

    placeShips(first_ship, first_ship_range, player_no, ret);
    placeShips(second_ship, second_ship_range, player_no, ret); // Second Passed ship by user
    placeShips(third_ship, third_ship_range, player_no, ret); // Third Passed ship by user
    return ret;
}

/**
 * Places Ships on table/grid
 * @param {*} ship_str String of the ship placement that user enters
 * @param {*} range_str Used to split, inorder to get range of ships
 * @param {*} player_no Which player's ship placement are these?
 * @param {*} loc_arr Assign them to location array
 */
function placeShips(ship_str, range_str, player_no, loc_arr) {
    var set_table;
    if (player_no == 1) {
        set_table = "shipTable_p1";
    } else {
        set_table = "shipTable_p2";
    }
    var get_range = range_str.split('-'); // splits the range
    var start = get_range[0];
    var end = get_range[1];

    var col_start = start.substr(0, 1);
    var row_start = start.substr(1);
    var col_end = end.substr(0, 1);

    switch (ship_str) {
        case "A":
            if (col_start != col_end) {
                var ind = col_arr.indexOf(col_start);
                loc_arr[0] = col_arr[ind] + row_start + "_" + set_table;
                loc_arr[1] = col_arr[(ind + 1)] + row_start + "_" + set_table;
                loc_arr[2] = col_arr[(ind + 2)] + row_start + "_" + set_table;
                loc_arr[3] = col_arr[(ind + 3)] + row_start + "_" + set_table;
                loc_arr[4] = col_arr[(ind + 4)] + row_start + "_" + set_table;
            } else {
                var ind = row_arr.indexOf(row_start);
                loc_arr[0] = col_start + row_arr[ind] + "_" + set_table;
                loc_arr[1] = col_start + row_arr[(ind + 1)] + "_" + set_table;
                loc_arr[2] = col_start + row_arr[(ind + 2)] + "_" + set_table;
                loc_arr[3] = col_start + row_arr[(ind + 3)] + "_" + set_table;
                loc_arr[4] = col_start + row_arr[(ind + 4)] + "_" + set_table;
            }
            break;
        case "B":
            if (col_start != col_end) {
                var ind = col_arr.indexOf(col_start);
                loc_arr[5] = col_arr[ind] + row_start + "_" + set_table;
                loc_arr[6] = col_arr[(ind + 1)] + row_start + "_" + set_table;
                loc_arr[7] = col_arr[(ind + 2)] + row_start + "_" + set_table;
                loc_arr[8] = col_arr[(ind + 3)] + row_start + "_" + set_table;
            } else {
                var ind = row_arr.indexOf(row_start);
                loc_arr[5] = col_start + row_arr[ind] + "_" + set_table;
                loc_arr[6] = col_start + row_arr[(ind + 1)] + "_" + set_table;
                loc_arr[7] = col_start + row_arr[(ind + 2)] + "_" + set_table;
                loc_arr[8] = col_start + row_arr[(ind + 3)] + "_" + set_table;
            }
            break;
        case "S":
            if (col_start != col_end) {
                var ind = col_arr.indexOf(col_start);
                loc_arr[9] = col_arr[ind] + row_start + "_" + set_table;
                loc_arr[10] = col_arr[(ind + 1)] + row_start + "_" + set_table;
                loc_arr[11] = col_arr[(ind + 2)] + row_start + "_" + set_table;
            } else {
                var ind = row_arr.indexOf(row_start);
                loc_arr[9] = col_start + row_arr[ind] + "_" + set_table;
                loc_arr[10] = col_start + row_arr[(ind + 1)] + "_" + set_table;
                loc_arr[11] = col_start + row_arr[(ind + 2)] + "_" + set_table;
            }
            break;
    }
}

/**
 * Places hidden ships
 * @param {*} location_arr array of ship's location
 * @param {*} player Which player's table is this?
 */
function placeHiddenShips(location_arr, player) {
    var set_table;
    if (player == 1) {
        set_table = "hiddenTable_p1";
    } else {
        set_table = "hiddenTable_p2";
    }

    //Place Aircrafts
    var cell = document.getElementById(location_arr[0].split("_")[0] + "_" + set_table);
    cell.innerHTML = "A";

    cell = document.getElementById(location_arr[1].split("_")[0] + "_" + set_table);
    cell.innerHTML = "A";

    cell = document.getElementById(location_arr[2].split("_")[0] + "_" + set_table);
    cell.innerHTML = "A";

    cell = document.getElementById(location_arr[3].split("_")[0] + "_" + set_table);
    cell.innerHTML = "A";

    cell = document.getElementById(location_arr[4].split("_")[0] + "_" + set_table);
    cell.innerHTML = "A";

    //Place Battleships
    cell = document.getElementById(location_arr[5].split("_")[0] + "_" + set_table);
    cell.innerHTML = "B";

    cell = document.getElementById(location_arr[6].split("_")[0] + "_" + set_table);
    cell.innerHTML = "B";

    cell = document.getElementById(location_arr[7].split("_")[0] + "_" + set_table);
    cell.innerHTML = "B";

    cell = document.getElementById(location_arr[8].split("_")[0] + "_" + set_table);
    cell.innerHTML = "B";


    //Place Submarines
    var cell = document.getElementById(location_arr[9].split("_")[0] + "_" + set_table);
    cell.innerHTML = "S";

    cell = document.getElementById(location_arr[10].split("_")[0] + "_" + set_table);
    cell.innerHTML = "S";

    cell = document.getElementById(location_arr[11].split("_")[0] + "_" + set_table);
    cell.innerHTML = "S";

}