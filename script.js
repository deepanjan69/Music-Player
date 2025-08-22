console.log("hello")

let currentSongs = new Audio()

let songs

let currFolder

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder;
    let response = await fetch(`/${folder}/info.json`);
    let data = await response.json();

    songs = data.tracks.map(track => track.file);

    // Show songs in playlist
    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
            <li>
                <img class="invert" src="svgs/music.svg" alt="">
                <div class="info">
                    <div>${song}</div>
                    <div>Deepanjan</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img src="svgs/playicon.svg" alt="">
                </div>
            </li>`;
    }

    // Attach click events
    Array.from(songUL.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info div").innerText);
        });
    });

    return songs;
}


const playMusic = (track, pause = false) => {
    // let audio = new Audio("/Songs/" + track)
    currentSongs.src = `/${currFolder}/` + track
    if (!pause) {
        currentSongs.play()
        play.src = "svgs/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"


}

async function displayAlbums() {
    let response = await fetch(`/songs/info.json`);
    let albums = await response.json();

    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    for (let folder of albums.folders) {
        let res = await fetch(`/songs/${folder}/info.json`);
        let data = await res.json();

        cardContainer.innerHTML += `
            <div data-folder="songs/${folder}" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40px" height="40px" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="12" fill="#1ed760" />
                        <path d="M16.7519 11.1679L10.5547 7.03647C9.89015 6.59343 9 7.06982 9 7.86852V16.1315C9 16.9302 9.89015 17.4066 10.5547 16.9635L16.7519 12.8321C17.3457 12.4362 17.3457 11.5638 16.7519 11.1679Z" fill="#000000"/>
                    </svg>
                </div>
                <img src="/songs/${folder}/cover.jpeg" alt="">
                <h2>${data.title}</h2>
                <p>${data.description}</p>
            </div>`;
    }

    // Load playlist on card click
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(item.currentTarget.dataset.folder);
            playMusic(songs[0]);
        });
    });
}


async function main() {


    //Get the list of all the songs
    await getSongs("songs/bollywood")
    console.log(songs)
    playMusic(songs[0], true)

    //Display all the albums on teh page
    displayAlbums()

    //Attach an event listener to play next and previous
    play.addEventListener("click", () => {
        if (currentSongs.paused) {
            currentSongs.play()
            play.src = "svgs/pause.svg"
        }
        else {
            currentSongs.pause()
            play.src = "svgs/playicon.svg"
        }
    })

    //Listen for time update event 
    currentSongs.addEventListener("timeupdate", () => {
        console.log(currentSongs.currentTime, currentSongs.duration)
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSongs.currentTime)} / ${secondsToMinutesSeconds(currentSongs.duration)}`
        document.querySelector(".circle").style.left = (currentSongs.currentTime / currentSongs.duration) * 100 + "%"
    })

    //Add a event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSongs.currentTime = ((currentSongs.duration) * percent) / 100
    })

    //Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //Add an event listener for close icon
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })

    //Add an event listener to Previous
    previous.addEventListener("click", () => {
        currentSongs.pause()
        console.log("previous clicked")

        let index = songs.indexOf(currentSongs.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0)
            playMusic(songs[index - 1])
    })

    //Add an event listener to next
    next.addEventListener("click", () => {
        currentSongs.pause()
        console.log("next clicked")

        let index = songs.indexOf(currentSongs.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length)
            playMusic(songs[index + 1])
    })

    //Add an event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value)
        currentSongs.volume = parseInt(e.target.value) / 100
        if(currentSongs.volume > 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("svgs/mute.svg", "svgs/volume.svg")
        }
    })

    // //Load the playlist when ever the card is clicked
    // Array.from(document.getElementsByClassName("card")).forEach(e => {
    //     e.addEventListener("click", async item => {
    //         songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)

    //     })
    // })

    //Add an event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", (e)=>{
        if(e.target.src.includes("svgs/volume.svg")){
            e.target.src = e.target.src.replace("svgs/volume.svg", "svgs/mute.svg")
            currentSongs.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src = e.target.src.replace("svgs/mute.svg", "svgs/volume.svg")
            currentSongs.volume = 1
            document.querySelector(".range").getElementsByTagName("input")[0].value = 100
        }
    })




    // //play the first song
    // var audio = new Audio(songs[0])
    // // audio.play()
}

main()