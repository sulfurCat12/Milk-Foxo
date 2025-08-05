async function loadUserIDs() {
    const response = await fetch("../userData.json");
    const jsonData = await response.json();

    const userIDs = Object.keys(jsonData.users);
    const selection = document.getElementById("IDSelect");



    userIDs.forEach(function(userID) {
        const userData = jsonData.users[userID];

        const option = document.createElement("option");
        option.value = userID;
        option.text = userData.Username + " | " + userID;
        selection.appendChild(option);
    });





    selection.addEventListener('change', function (){
        handleSelected(selectedID);
    });

    function handleSelected(userID){
        const userData = jsonData.users[userID];
        console.log("Selected user: " + userData.Username)
    }
}

loadUserIDs();