const slides=[
  {ja:"展示風景",en:"Exhibition",img:"images/slide-01.jpg",note:"展覧会「アノビルのこと」の記録より。"},
  {ja:"1/20模型",en:"Model",img:"images/slide-02.jpg",note:"会場に置かれた大きな白い模型。"},
  {ja:"1/100模型",en:"Study Model",img:"images/slide-03.jpg",note:"周辺建物との関係を読み取るための模型。"},
  {ja:"断片から全体へ",en:"Fragment",img:"images/slide-04.jpg",note:"街の断片を重ねながら全体を知覚する。"},
  {ja:"抽象化への探求",en:"Abstraction",img:"images/slide-05.jpg",note:"抽象化を単純化ではなく、世界の見方として捉える。"},
  {ja:"横山町とアノビル",en:"Yokoyamacho",img:"images/slide-06.jpg",note:"東京・日本橋横山町を舞台とした建築提案。"},
  {ja:"読む建築展",en:"Reading Architecture",img:"images/slide-07.jpg",note:"本、模型、椅子を通して建築を読む展示。"},
  {ja:"アーカイブブック",en:"Archive Book",img:"images/slide-08.jpg",note:"展示と設計の記録をまとめた冊子。"}
];

let current=0;
let introDone=false;

const intro=document.getElementById("intro-screen");
const main=document.getElementById("main-content");

const count=document.getElementById("slide-count");
const titleJa=document.getElementById("slide-title-ja");
const titleEn=document.getElementById("slide-title-en");
const note=document.getElementById("slide-note");
const image=document.getElementById("slide-image");
const placeholder=document.getElementById("slide-placeholder");
const frame=document.getElementById("slide-frame");
const prev=document.getElementById("prev-slide");
const next=document.getElementById("next-slide");

function finishIntro(){
  if(introDone) return;
  introDone=true;
  document.body.classList.remove("intro-active");
  intro.classList.add("is-hidden");
  main.classList.add("is-visible");
}

function setupIntro(){
  const timer=setTimeout(finishIntro,3000);
  intro.addEventListener("click",()=>{
    clearTimeout(timer);
    finishIntro();
  });
  document.addEventListener("keydown",(e)=>{
    if(introDone) return;
    if(e.key==="Enter"||e.key===" "){
      e.preventDefault();
      clearTimeout(timer);
      finishIntro();
    }
  });
}

function showPlaceholder(){
  image.hidden=true;
  placeholder.hidden=false;
}

function showImage(){
  image.hidden=false;
  placeholder.hidden=true;
}

function render(){
  const s=slides[current];
  count.textContent=`${current+1}/${slides.length}`;
  titleJa.textContent=s.ja;
  titleEn.textContent=s.en;
  note.textContent=s.note;
  image.onload=showImage;
  image.onerror=showPlaceholder;
  image.alt=s.ja;
  image.src=s.img;
}

function nextSlide(){
  current=(current+1)%slides.length;
  render();
}

function prevSlide(){
  current=(current-1+slides.length)%slides.length;
  render();
}

frame.addEventListener("click",nextSlide);
frame.addEventListener("keydown",(e)=>{
  if(e.key==="Enter"||e.key===" "){
    e.preventDefault();
    nextSlide();
  }
});

prev.addEventListener("click",(e)=>{
  e.preventDefault();
  prevSlide();
});

next.addEventListener("click",(e)=>{
  e.preventDefault();
  nextSlide();
});

document.addEventListener("keydown",(e)=>{
  if(!introDone) return;
  if(e.key==="ArrowRight") nextSlide();
  if(e.key==="ArrowLeft") prevSlide();
});

setupIntro();
render();
