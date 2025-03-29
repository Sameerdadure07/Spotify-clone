console.log('Lets go to wirte JS');
let currentsong = new Audio();
let songs;
let currFolder;

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

async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3002/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }


    // Showing all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="songinfo">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Sammy</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/newplay.svg" alt="">
                            </div> </li>`;
    }

    // Attaching the event listener to each song

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".songinfo").firstElementChild.innerHTML);
            playMusic(e.querySelector(".songinfo").firstElementChild.innerHTML.trim())
        })
    })

    return songs
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/Songs/" + track)
    currentsong.src = `/${currFolder}/` + track
    if (!pause) {
        currentsong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfoo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"


}

async function displayAlbums() {
    // console.log('heloo1');
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardscontainer = document.querySelector(".cardscontainer")
    let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
        // if(e.href.includes("/songs") && !e.href.includes(".htaccess")){
        if(e.href.includes("http://127.0.0.1:3002/songs/") && !e.href.includes(".htaccess")){
            let folder = (e.href.split("/").slice(-2)[0]);
            console.log(folder);
            
            // get metadata of folder

            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response);
            cardscontainer.innerHTML = cardscontainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play"><img src="newplay.svg" alt=""></div>
                        <img src="/songs/${folder}/cover.jpeg" alt="Happy">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }
    // Load the Playlist when Card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            // console.log();
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
            // current target ke help seh kahi pr bhi click krne seh apna folder open ho jayega jo ki target seh sirf card pr click krne seh open ho raha tha
        })
    })
}

async function main() {


    // Get the list of all songs
    await getsongs("songs/Albums")
    // console.log(songs);
    playMusic(songs[0], true)

    // Display All the album on the page
    displayAlbums();
    // console.log('heloo');




    // Attaching Event Lister to play, pause, next, previous.
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "img/playplay.svg"

        }
    })

    // Liste for time update event
    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime, currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = ((currentsong.currentTime / currentsong.duration) * 100 + "%");

    })

    // Adding event listener to a seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100
    })

    // Adding event listener to a hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Adding event listener to a close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Event listner for Previous and next

    previous.addEventListener("click", () => {
        // console.log('Previous Clicked');

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        currentsong.pause()
        // console.log('Next Clicked');

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length - 1) {
            playMusic(songs[index + 1])
        }

    })

    // Adding event listner for volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log("setting valume :-", e.target.value);

        currentsong.volume = parseInt(e.target.value) / 100

    })

    // Eventlistner for Mute
    document.querySelector(".volume>img").addEventListener("click", e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg")
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            currentsong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 30;
        }
    })

    


}

main()
