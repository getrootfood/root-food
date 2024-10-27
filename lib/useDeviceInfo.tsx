import { useState, useEffect } from "react";

const useDeviceInfo = () => {
  const [os, setOS] = useState("Unknown OS");

  useEffect(() => {
    const userAgent = navigator.userAgent;

    if (userAgent.includes("Win")) setOS("Windows");
    else if (userAgent.includes("Mac")) setOS("Mac OS");
    else if (userAgent.includes("Linux")) setOS("Linux");
    else if (userAgent.includes("Android")) setOS("Android");
    else if (/iPhone|iPad|iPod/.test(userAgent)) setOS("iOS");
    else setOS("Other");
  }, []);

  return os;
};

export default useDeviceInfo;
