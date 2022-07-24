import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import sound from './waited.mp3'
import "./App.css";

function App() {
  const winMinutes = 111;
  const [waited, setWaited] = useState(false);
  const [started, setStarted] = useState(false);

  let sessionId;
  let userInformation;
  let minutes = 0;
  let completed = false;


  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
  const supabaseClient = createClient(supabaseUrl, supabaseKey);

  const playAudio = () => {
    const audio = new Audio(sound)
    audio.play();
  }

  const getLocation = async () => {
    try {
      if (localStorage.getItem("countryCode"))
        return localStorage.getItem("countryCode");
      const res = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
      console.log({res})
      if (!res.ok) throw new Error(await res.text());
      const data = await res.text();
      const reduce = data.trim().split('\n').reduce(function(obj, pair) {
        pair = pair.split('=');
        return obj[pair[0]] = pair[1], obj;
      }, {});
      console.log({data})
      localStorage.setItem("countryCode", JSON.stringify(reduce));
      return reduce;    
    } catch (error) {
      console.error(
        `error getting location from api.db-ip.com:`,
        error.message
      );
    }
  };

  const submit = async () => {
    const { data, error } = await supabaseClient
      .from('wait_log')
      .insert([
        { user_id: sessionId, complete: completed, user_information: userInformation },
      ])
  }

  const recordSession = async () => {
    console.log({uiBefore: userInformation});
    if (!userInformation)
      userInformation = await getLocation();
    console.log({uiAfter: userInformation});
    console.log({sBefore: sessionId});
    if (!sessionId)
      sessionId = crypto.randomUUID();
    console.log({sAfter: sessionId});

    console.log({mBefore: minutes});
    minutes = minutes + 1;
    console.log({mAfter: minutes});
    if (minutes >= winMinutes) {
      clearInterval(interval);
      completed = true;
      setWaited(true);
      playAudio();
    }

    
    await submit();
  }

  const interval = setInterval(() => {
    console.log('opened');
    if (waited || !started) {
      clearInterval(interval);
      console.log('cleared');
      return;
    }
    recordSession();
  }, 1000 * 10);

  return (
    <>
    <div className="main">
      {
        (() => {
          if (!started){
            return (
              <>
                <div className="begin">
                  <button onClick={() => setStarted(true)}>
                    ! Begin !
                  </button>
                </div>
              </>
            )
          } else {
            return (
              <>
                <div className="content">
                  {(() => {
                    if (!waited) {
                      return (
                        <>
                          <p>Please Wait</p>
                          <div id="1" className="ellipsis"></div>
                        </>
                      );
                    } else {
                      return <p className="waited">Thank you</p>;
                    }
                  })()}
                </div>
              </>
            )
          }
        })()
      }
    </div>
    </>
  );
}

export default App;
