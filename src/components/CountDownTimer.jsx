import { useState, useEffect } from "react"
import dateFormat, { masks } from "dateformat";

export default function CountDownTimer() {
  const date = new Date("Nov 20, 2022 15:00:00Z").getTime();
  const [seconds, setSeconds] = useState("");
  const [minutes, setMinutes] = useState("");
  const [hours, setHours] = useState("");
  const [days, setDays] = useState("");
  dateFormat()

  const updateTimer = () => {
    const sec = 1000;
    const min = sec * 60; 
    const hour = min * 60; 
    const day = hour * 24 
    const now = new Date().getTime();
    const gap = date - now;
    setSeconds(Math.floor((gap % min) / sec));
    setMinutes(Math.floor((gap % hour) / min));
    setHours(Math.floor((gap % day) / hour));
    setDays(Math.floor(gap / day));
  }

  useEffect(() => {
    const intervel = setInterval(updateTimer, 1000)
    return ()=>clearInterval(intervel)
  }, []);
  
  return (
    <h1 className="count-down">
      <div className="count-down-item">
        <span>{days < 10 ? `0${days}`:days}</span>
        <span>Days</span>
      </div>
      <span>:</span>
      <div className="count-down-item">
      <span>{hours <10 ? `0${hours}`:hours}</span>
        <span>hours</span>
      </div>
      <span>:</span>
      <div className="count-down-item">
        <span>{minutes <10 ? `0${minutes}`:minutes}</span>
        <span>minutes</span>
      </div>
      <span>:</span>
      <div className="count-down-item">
        <span>{ seconds <10 ? `0${seconds}`:seconds}</span>
        <span>seconds</span>
      </div>
    </h1>
  )
}
