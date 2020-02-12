const firebaseConfig = {
    apiKey: "AIzaSyCHgaH0ExB2rPBSJXZLCoMDpclrzzlnL9E",
    authDomain: "train-scheduler-64274.firebaseapp.com",
    databaseURL: "https://train-scheduler-64274.firebaseio.com",
    projectId: "train-scheduler-64274",
    storageBucket: "train-scheduler-64274.appspot.com",
    messagingSenderId: "131499302311",
    appId: "1:131499302311:web:4ed9d37a6f5b1bedaa6a82"
};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();

let index = 0;

var trainName = "";
var destination = "";
var firstTrainTime = 0;
var frequency = 0;
var dateAdded = "";

let newTrainSchedule;

let checkTabelLength = function () {
    if ($('.table tbody tr').length < 1) {
        $('.table').css('display', 'none');
        $('#noRecord').fadeIn();
    } else {
        $('#noRecord').css('display', 'none');
        $('.table').fadeIn();
    }
}

let getTrainData = function () {
    // Grabs user input
    trainName = $("#train-name")
        .val()
        .trim();
    destination = $("#destination")
        .val()
        .trim();
    firstTrainTime = moment($("#first-train-time")
        .val()
        .trim(), "HH:mm").format("X");
    frequency = $("#frequency")
        .val()
        .trim();


    // Creates local "temporary" object for holding employee data
    newTrainSchedule = {
        trainName: trainName,
        destination: destination,
        first: firstTrainTime,
        frequency: frequency,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
    };

    return newTrainSchedule;
}

// 2. Button for adding Employees
let submitRow = function (event) {
    event.preventDefault();

    getTrainData();

    // Uploads employee data to the database
    database.ref('/schedule/').push(newTrainSchedule);

    // Logs everything to console
    console.log(newTrainSchedule.trainName);
    console.log(newTrainSchedule.destination);
    console.log(newTrainSchedule.first);
    console.log(newTrainSchedule.frequency);

    alert("Train Schedule successfully added");

    // Clears all of the text-boxes
    $("#train-name").val("");
    $("#destination").val("");
    $("#first-train-time").val("");
    $("#frequency").val("");
}

// 3. Create Firebase event for adding schedule to the database and a row in the html when a user adds an entry
database.ref('/schedule/').orderByChild("dateAdded").on("child_added", function (childSnapshot) {
    console.log(childSnapshot.val());
    console.log('key = ' + childSnapshot.key);

    // Store everything into a variable.
    let trainName = childSnapshot.val().trainName;
    let destination = childSnapshot.val().destination;
    let firstTrainTime = childSnapshot.val().first;
    let frequency = childSnapshot.val().frequency;
    let dateAdded = childSnapshot.val().dateAdded;


    // Employee Info
    console.log('name added to db = ' + trainName);
    console.log('added to db = ' + destination);
    console.log('added to db =' + firstTrainTime);
    console.log('added to db = ' + frequency);

    let currentTime = moment();
    let diffTime = moment().diff(moment.unix(firstTrainTime), "minutes");
    let tRemainder = diffTime % frequency;
    let tMinutesTillTrain = frequency - tRemainder;
    console.log("MINUTES TILL TRAIN: " + tMinutesTillTrain);

    // Next Train
    let nextTrain = moment().add(tMinutesTillTrain, "minutes");
    let nextTRainConverted = moment(nextTrain).format("hh:mm");

    var newRow = $(`<tr class='row-${index}'>`).append(
        $("<td id='newName'>").text(trainName),
        $("<td id='newDestination'>").text(destination),
        $("<td id='newFrequency'>").text(frequency),
        $("<td>").text(nextTRainConverted),
        $("<td>").text(tMinutesTillTrain),
        $(`<td id='editSchedule' data-key='${childSnapshot.key}'>`).html("<i class='fa fa-edit'></i>"),
        $(`<td id='removeSchedule' data-key='${childSnapshot.key}'>`).html("<i class='fa fa-times'></i>"),
    );



    $("tbody").append(newRow);
    checkTabelLength();

    index++;
});


const editRow = function (trclass, childKey) {

    database.ref('/schedule/').child(childKey).on("value", function (snapshot) {
        $("#train-name").val(snapshot.val().trainName);
        $("#destination").val(snapshot.val().destination);
        $("#first-train-time").val(moment.unix(snapshot.val().first).format("hh:mm"));
        $("#frequency").val(snapshot.val().frequency);
    });
}

const removeRow = function (closestTrClass, childKey) {
    $(`.${closestTrClass}`).remove();

    database.ref('/schedule/').child(childKey).remove();
    checkTabelLength();
}

$(document).on('click', '#removeSchedule', function () {
    let closestTrClass = $(this).closest('tr').attr('class');
    let childKey = $(this).attr("data-key");
    removeRow(closestTrClass, childKey);

});

$(document).on('click', '#editSchedule', function () {
    $('#submitSchedule').fadeOut(5, function () {
        $("#updateSchedule").fadeIn();
    });

    console.log('here', $(this).closest('tr').attr('class'));
    let closestTrClass = $(this).closest('tr').attr('class');
    let childKey = $(this).attr("data-key");
    editRow(closestTrClass, childKey);
    $('#childKey').val(childKey);
});


checkTabelLength();

$(document).on("click", "#submitSchedule", submitRow);
$(document).on("click", "#updateSchedule", function (event) {
    event.preventDefault();
    let childKey = $('#childKey').val();
    getTrainData();
    database.ref('/schedule/').child(childKey).set(newTrainSchedule);

    database.ref('/schedule/').child(childKey).on("value", function (childSnapshot) {
        let trainName = childSnapshot.val().trainName;
        let destination = childSnapshot.val().destination;
        let firstTrainTime = childSnapshot.val().first;
        let frequency = childSnapshot.val().frequency;
        let dateAdded = childSnapshot.val().dateAdded;
    
        $("#train-name").val("");
        $("#destination").val("");
        $("#first-train-time").val("");
        $("#frequency").val("");
         

        $(`#editSchedule[data-key='${childKey}']`).find("#newName").text("trainName");
    
    });

});






$(document).on("click", "#removeSchedule", removeRow);