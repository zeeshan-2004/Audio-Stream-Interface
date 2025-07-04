
let songs;
let currFolder;
let currentSong=new Audio();
function convertToMinutesSeconds(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // Always return two-digit format for minutes and seconds
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');

    return `${mm}:${ss}`;
}


async function getSongs(folder) {
    // const a = await fetch("http://127.0.0.1:5500/songs/");
    currFolder=folder;
    const a = await fetch(`http://127.0.0.1:5500/${folder}/`);
       const response = await a.text();

    const div = document.createElement("div");
    div.innerHTML = response;

    const links = div.getElementsByTagName("a");
    songs = [];

    for (let link of links) {
        if (link.href.endsWith(".mp3")) {
            // Get only the file name
            const fileName = link.href.split("/").pop(); // e.g., "mysong.mp3"
            songs.push(fileName);
        }
    }
 const songList = document.querySelector(".songlist ul");
  songList.innerHTML="";
    for (let song of songs) {
        const displayName = decodeURIComponent(song.replace("%20", " "));

        songList.innerHTML += `
        <li>
            <img src="music.svg" class="inv">
            <div class="info">
                <div>${displayName}</div>
                <div>artist</div>
            </div>
            <div class="playnow">
                <span>play now</span>
                <img src="play.svg" class="inv">
            </div>
        </li>`;
    }
  Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e)=>{
    e.addEventListener("click",element=>{
 // console.log(e.querySelector(".info").firstElementChild.innerHTML)
  playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    })
  })
    return songs;

}
async function displayAlbum() {
    const a = await fetch(`/songs/`);
    const response = await a.text();

    const div = document.createElement("div");
    div.innerHTML = response;

    const links = div.getElementsByTagName("a");

    let arr=Array.from(links)    
    for (let index = 0; index < arr.length; index++) {
        const e = arr[index];
        if (e.href.includes("/songs/")) {
            let hrefParts = e.href.split("/");
            let folder = hrefParts[hrefParts.length - 2];

            if (folder.toLowerCase() === "songs") continue;

            try {
                const res = await fetch(`/songs/${folder}/info.json`);
                const json = await res.json();

                console.log(`✅ Loaded info.json for '${folder}'`, json);

                const cardContainer = document.querySelector(".card-container");
                if (!cardContainer) {
                    console.error("❌ .card-container not found in HTML!");
                    return;
                }

                cardContainer.innerHTML += `
                    <div class="card" data-folder="${folder}">
                        <img src="/songs/${folder}/cover.jpeg" alt="${json.title}" />
                        <h2>${json.title}</h2>
                        <p>${json.description}</p>
                    </div>
                `;
            } catch (err) {
                console.error(`❌ Failed to load info.json for '${folder}':`, err);
            }
        }
            Array.from(document.querySelectorAll(".card")).forEach((e)=>{
   e.addEventListener("click",async(item)=>{
    console.log(currFolder);
     songs = await getSongs(`songs/${ item.currentTarget.dataset.folder}`);
         playMusic(songs[0]);
  
   })
  })
    };
 
}
 displayAlbum();



async function main() {
  songs=await getSongs("songs/ncs");
 // display album on page
   playMusic(songs[0],true)
  
  let play=document.querySelector("#play");
  play.addEventListener("click",()=>{
    if(currentSong.paused){
    currentSong.play();
    play.src="pause.svg";
    }
    else{
         currentSong.pause();
    play.src="play.svg";
    }
  })
  //listen time update
  currentSong.addEventListener("timeupdate",()=>{
    // console.log(currentSong.currentTime,currentSong.duration);
      const current = Math.floor(currentSong.currentTime);
    const duration = Math.floor(currentSong.duration) || 0;
    document.querySelector(".songTime").innerHTML=`${convertToMinutesSeconds(current)} / ${convertToMinutesSeconds(duration)}`;
    document.querySelector(".circle").style.left=((currentSong.currentTime) /(currentSong.duration) )* 100 +"%";
    //add eventlisteren to seekbar

  })
  // listeren for hamburger
  document.querySelector(".first").addEventListener("click",()=>{
    document.querySelector(".left").style.left="0";
  })
  // listeren for close
  document.querySelector(".close").addEventListener("click",()=>{
    document.querySelector(".left").style.left="-100%" ;
  })

  //add event listeren for prevois
  document.querySelector("#previous").addEventListener("click",()=>{
   // console.log("previouis");
    //console.log(currentSong);
    // console.log(currentSong.src.split("/").slice(-1))[0];
    let index=songs.indexOf((currentSong.src.split("/").slice(-1))[0]);
    //console.log(index);
    if((index-1) >= 0)
    playMusic(songs[index-1])

  })
  //add event listeren for next
  document.querySelector("#next").addEventListener("click",()=>{
    // console.log("next")
    // console.log(currentSong.src.split("/").slice(-1))[0];
    let index=songs.indexOf((currentSong.src.split("/").slice(-1))[0]);
    // console.log(index);
    if((index+1) < songs.length)
    playMusic(songs[index+1])

  })
  //add listeren to rangebar
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
console.log(e.target.value);
currentSong.volume=parseInt(e.target.value);
  }) 
  //load the playlist
 
}


main();

document.querySelector(".seekbar").addEventListener("click", (e) => {
  // console.log(e.target.getBoundingClientRect().width,e.offsetX ); 
  let percent=(e.offsetX/e.target.getBoundingClientRect().width)*100
      document.querySelector(".circle").style.left=percent+"%";
      currentSong.currentTime=((currentSong.duration)*percent)/100;
})

let   playMusic=(track,pause=false)=>{
currentSong.src=`/${currFolder}/`+track;
if(!pause){
currentSong.play();
 play.src="pause.svg";
}
document.querySelector(".songInfo").innerHTML=decodeURI(track);
document.querySelector(".songTime").innerHTML="00:00 / 00:00";
}