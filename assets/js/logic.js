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

let trainName = "";
let destination = "";
let firstTrainTime = 0;
let frequency = 0;
let dateAdded = "";

let nextTrain = 0;
let nextTRainConverted = 0;
let tMinutesTillTrain = 0;

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

let nextTrainCalculations = function(firstTrainTime, frequency){
    let currentTime = moment();
    let diffTime = moment().diff(moment.unix(firstTrainTime), "minutes");
    let tRemainder = diffTime % frequency;
    tMinutesTillTrain = frequency - tRemainder;
    console.log("MINUTES TILL TRAIN: " + tMinutesTillTrain);

    // Next Train
     nextTrain = moment().add(tMinutesTillTrain, "minutes");
     nextTRainConverted = moment(nextTrain).format("hh:mm");

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

    nextTrainCalculations(firstTrainTime, frequency);

    var newRow = $(`<tr class='row-${index}'>`).append(
        $("<td class='newName'>").text(trainName),
        $("<td class='newDestination'>").text(destination),
        $("<td class='newFrequency'>").text(frequency),
        $("<td class='newNextTrain'>").text(nextTRainConverted),
        $("<td class='newMinutesTill'>").text(tMinutesTillTrain),
        $(`<td class='editSchedule' data-key='${childSnapshot.key}'>`).html("<i class='fa fa-edit'></i>"),
        $(`<td class='removeSchedule' data-key='${childSnapshot.key}'>`).html("<i class='fa fa-times'></i>"),
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

$(document).on('click', '.removeSchedule', function () {
    let closestTrClass = $(this).closest('tr').attr('class');
    let childKey = $(this).attr("data-key");
    removeRow(closestTrClass, childKey);

});

$(document).on('click', '.editSchedule', function () {
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
         
       let editScheduleSelectedTr = $(`.editSchedule[data-key='${childKey}']`).closest('tr');

       editScheduleSelectedTr.find(".newName").eq(0).text(trainName);
       editScheduleSelectedTr.find(".newDestination").eq(0).text(destination);
       editScheduleSelectedTr.find(".newFrequency").eq(0).text(frequency);

       nextTrainCalculations(firstTrainTime, frequency);
       console.log(nextTRainConverted);
       editScheduleSelectedTr.find(".newNextTrain").eq(0).text(nextTRainConverted);
       editScheduleSelectedTr.find(".newMinutesTill").eq(0).text(tMinutesTillTrain);
    
    });
});

$(document).on("click", ".removeSchedule", removeRow);