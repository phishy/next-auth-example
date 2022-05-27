import { useState } from "react"
import Head from "next/head"
import Image from "next/image"

import Layout from "../components/Layout"
import styles from "../styles/Home.module.css"

import { FaPlayCircle } from "react-icons/fa"

import useWindowSize from "react-use/lib/useWindowSize"
import Confetti from "react-confetti"

function getYears() {
  const years = []
  const exclude = [2001, 2005, 2006, 2007, 2008, 2020]
  for (let i = 1988; i <= new Date().getFullYear(); i++) {
    if (!exclude.includes(i)) {
      years.push(i)
    }
  }
  return years
}

async function getRandomSet() {
  let years = getYears()

  const randomYear = years[Math.floor(Math.random() * years.length)]

  let randomShow = await fetch(
    `https://www.phishtracks.com/_next/data/static-for-export/shows/${randomYear}.json`
  )
    .then((res) => res.json())
    .then((data) => {
      let shows = data.pageProps.show
      let randomShow = shows[Math.floor(Math.random() * shows.length)]
      return randomShow
    })

  let tracks = await fetch(
    `https://www.phishtracks.com/_next/data/static-for-export/shows/${randomShow.show_date}.json`
  ).then((res) => res.json())

  let sets = tracks.pageProps.show.sets
    .filter((set) => set.title !== "Encore")
    .filter((set) => set.tracks.length > 3)

  let set = sets[Math.floor(Math.random() * sets.length)]
  console.log("FLARK", set)
  return [set, randomShow]
}

export async function getServerSideProps(context) {
  let [randomSet, show] = await getRandomSet()

  while (randomSet === "undefined") {
    randomSet = await getRandomSet()
  }

  console.log("set", randomSet)

  let randomTrack =
    randomSet.tracks[Math.floor(Math.random() * randomSet.tracks.length)]

  let uniqueTracks = [randomTrack]

  while (uniqueTracks.length < 3) {
    let randomTrack =
      randomSet.tracks[Math.floor(Math.random() * randomSet.tracks.length)]
    if (!uniqueTracks.includes(randomTrack)) {
      uniqueTracks.push(randomTrack)
    }
  }

  uniqueTracks = uniqueTracks.sort(() => Math.random() - 0.5)

  // for (let i = 0; i < 2; i++) {
  //   let rand = Math.floor(Math.random() * randomSet.tracks.length)
  //   console.log('FLARK', rand);

  //   let random = randomSet.tracks[rand]

  //   randomSet.tracks = randomSet.tracks.filter(
  //     (track) => track.track_id !== random.track_id
  //   )

  //   // if (!uniqueTracks.includes(randomTrack)) {
  //   //   uniqueTracks.push(randomTrack)
  //   // }
  // }

  console.log({ show, randomTrack, uniqueTracks })

  return {
    props: {
      show,
      randomTrack,
      uniqueTracks,
    },
  }
}

export default function Home(props) {
  const [correct, setCorrect] = useState(false)
  const { width, height } = useWindowSize()

  const handlePlay = () => {
    const audioObj = new Audio(props.randomTrack.file_url, { preload: true })
    audioObj.onloadedmetadata = function () {
      let start = audioObj.duration / 2
      let stop = audioObj.duration / 2 + 1
      playSegment(audioObj, start, stop)
    }

    function playSegment(audioObj, start, stop) {
      let audioObjNew = audioObj
      // let audioObjNew = audioObj.cloneNode(true) //this is to prevent "play() request was interrupted" error.
      audioObjNew.currentTime = start
      audioObjNew.play()
      console.log({ start, stop })
      audioObjNew.int = setInterval(function () {
        if (audioObjNew.currentTime > stop) {
          console.log("YO")
          audioObjNew.pause()
          clearInterval(audioObjNew.int)
        }
      }, 10)
    }
  }

  const handleAnswer = (track) => {
    if (track.id === props.randomTrack.id) {
      setCorrect(true)
      // setTimeout(() => {
      //   window.location.reload()
      // }, 5000)
    } else {
      alert(`Wrong, you dog log! It was ${props.randomTrack.title}`)
    }
  }

  return (
    <Layout>
      <div className={styles.container}>
        <Head>
          <title>Create Next App</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        {correct && <Confetti width={width} height={height} />}

        <main className={styles.main}>
          <h1 className={styles.title}>
            PHiSH Trivia
            {correct && (
              <Image src="/phish-trey.gif" width={517} height={652} />
            )}
          </h1>

          {correct && (
            <div>
              <div className={styles.continue} onClick={() => window.location.reload()}>
                Continue
              </div>
              <audio src={props.randomTrack.file_url} controls />
              <h3>{props.randomTrack.title}</h3>
              <h4>{props.show.show_date}</h4>
              <h5>{props.show.location}</h5>
            </div>
          )}

          <FaPlayCircle className={styles.play} onClick={handlePlay}>
            Play
          </FaPlayCircle>
          {props.uniqueTracks.map((track, index) => (
            <div
              key={index}
              className={styles.answer}
              onClick={() => handleAnswer(track)}
            >
              {track.title}
            </div>
          ))}
        </main>
      </div>
    </Layout>
  )
}
