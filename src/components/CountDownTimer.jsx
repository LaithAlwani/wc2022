import { useState, useEffect } from "react"

export default function CountDownTimer() {
  const date = new Date("Nov 20, 2022 05:00:00").getTime();
  const [seconds, setSeconds] = useState("");
  const [minutes, setMinutes] = useState("");
  const [hours, setHours] = useState("");
  const [days, setDays] = useState("");
  
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
    <div className="count-down">
      <div className="count-down-item">
        <span>{days}</span>
        <span>Days</span>
      </div>
      <span>:</span>
      <div className="count-down-item">
        <span>{ hours}</span>
        <span>hours</span>
      </div>
      <span>:</span>
      <div className="count-down-item">
        <span>{ minutes}</span>
        <span>minutes</span>
      </div>
      <span>:</span>
      <div className="count-down-item">
        <span>{ seconds}</span>
        <span>seconds</span>
      </div>
    </div>
  )
}
