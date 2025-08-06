async function loadUserIDs() {
    const response = await fetch("../../userData.json");
    const jsonData = await response.json();

    const userIDs = Object.keys(jsonData.users);
    const selection = document.getElementById("IDSelect");



    userIDs.forEach(function(userID) {
        const userData = jsonData.users[userID];

        const option = document.createElement("option");
        option.value = userID;
        option.text = `${userData.Username} | ${userID}`;
        selection.appendChild(option);
    });




    const usernameDisplay = document.getElementById("usernameDisplay");
    const userIDDisplay = document.getElementById("userIDDisplay");
    const joinDateDisplay = document.getElementById("joinDateDisplay");
    const avatarDisplay = document.getElementById("avatarDisplay");
    const bannerDisplay = document.getElementById("bannerDisplay");
    const colourDisplay = document.getElementById("colourDisplay");

    const userPic = document.getElementById("userPic");
    const viewAvatarBTN = document.getElementById("viewAvatar");
    const viewBannerBTN = document.getElementById("viewBanner");

    selection.addEventListener('change', function (){
        const selectedID = this.value;
        handleSelected(selectedID);
    });

    function handleSelected(userID){
        const userData = jsonData.users[userID];

        usernameDisplay.innerHTML = `Username: ${userData.Username}`;
        userIDDisplay.innerHTML = `User ID: ${userData.UserID}`;
        joinDateDisplay.innerHTML = `Join Date: ${userData.Join_Date}`;
        colourDisplay.innerHTML = `Profile Colour: ${userData.Profile_Colour}`;

        userPic.src = userData.Avatar_URL;
        viewAvatarBTN.href = userData.Avatar_URL + "?size=2048";
        viewBannerBTN.href = userData.Banner_URL + "?size=2048";
    }
}

loadUserIDs();