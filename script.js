// console.log("Lets write java script")
let currentsong = new Audio();
let songs;
let currFolder;

function secondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);

    // Ensure two-digit formatting
    let formattedMinutes = (minutes < 10) ? `0${minutes}` : `${minutes}`;
    let formattedSeconds = (remainingSeconds < 10) ? `0${remainingSeconds}` : `${remainingSeconds}`;

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    // console.log(response)
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
    

    //Show All The Songs In The Playlist 
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""


    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="music.svg" alt="music icon">
                                                   <div class="info">
                                                   <div>${song.replaceAll("%20", " ")}</div>
                                                   <div>Veeru</div>
                                                   </div>
                                                   <div class="playnow">
                                                   <span>Play Now</span>
                                                   <img class="invert" src="play.svg" alt="">
                                                   </div>
                                               </li>`;
    }
    //Attach an event Listener to each song 
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })
    return songs
}

const playmusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    // audio.play()
    currentsong.src = `/${currFolder}/` + track
    if (!pause) {
        currentsong.play()
        play.src = "pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}
async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    // console.log(response) 
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 

        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]

            // grt the meta data for the folder 
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}"  class="card">
           <div class="play">
               <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24"
                   fill="none">

                   <!-- Black path (play button) centered within the circular box -->
                   <path d="M7 18V6L17 12L7 18Z" stroke="#000000" stroke-width="1.5" fill="#000"
                       stroke-linejoin="round" />
               </svg>

           </div>
           <img src="/songs/${folder}/cover.jpg" alt="">
           <h2>${response.title}</h2>
           <p>${response.description}</p>
       </div>`
        }
    }

    //Load the library when the card is clicked 
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
    playmusic(songs[0])

        })
    })

}


async function main() {

    //Getting all te songs 
    await getSongs("songs/ncs")
    // console.log(songs)

    playmusic(songs[0], true)

    // Display all the albums in the page 
    displayAlbums()



    // Attach an event listener to play , next and previous 
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "play.svg"

        }
    })
    // listen for time update event 
    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime, currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutes(currentsong.currentTime)}/${secondsToMinutes(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })

    //Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;
    })
    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    // Add an event listener for closebutton
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })
    //Add an event listener to previous and next 
    previous.addEventListener("click", () => {
        // console.log("Previous Clicked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        console.log(songs, index)
        if ((index - 1) >= 0) { playmusic(songs[index - 1]) }
    })
    next.addEventListener("click", () => {
        // console.log("Next Clicked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        console.log(songs, index)
        if ((index + 1) < songs.length) { playmusic(songs[index + 1]) }
    })
    //Add an event to volume 
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log(e,e.target,e.target.value)
        currentsong.volume = parseInt(e.target.value) / 100
        if (currentsong.volume>0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")
                
        }
    })


    //ADD  an event listener to mute the track 
    document.querySelector(".volume>img").addEventListener("click" , e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src= e.target.src.replace("volume.svg","mute.svg")
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src= e.target.src.replace("mute.svg","volume.svg")
            currentsong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10; 
        }
    })



    // //play the songs 
    // var audio = new Audio(songs[0]);
    // audio.play();
    // audio.addEventListener("loadeddata", () => {
    //     let duration = audio.duration;
    //     console.log(audio.duration, audio.currentSrc, audio.currentTime)
    // });



}

main()