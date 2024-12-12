import { createContext,useContext } from "react";
import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";


const ChatContext = createContext()

const ChatProvider = ({children}) => { 
  const [currentUser, setcurrentuser] = useState()
  const navigate = useNavigate();

  useEffect(() => {
     const userinfo = JSON.parse(localStorage.getItem("Userdata"))
     if(userinfo){
        setcurrentuser(userinfo);
     }else if(window.location.pathname !== '/login' && window.location.pathname !== 'signup'){
        navigate("/signup") 
     }
  }, [navigate])    
  
  
  return (
    <ChatContext.Provider value={{ currentUser, setcurrentuser }}>
      {children}
    </ChatContext.Provider>
  );
}

export const ChatState = () => {
    return useContext(ChatContext);
}

export default ChatProvider