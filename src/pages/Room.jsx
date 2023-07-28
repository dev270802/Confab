import React,{useState,useEffect} from 'react'
import client,{databases,DATABASE_ID,COLLECTION_ID_MESSAGES} from '../appwriteConfig'
import {ID,Query,Role,Permission} from 'appwrite'
import {Trash2} from 'react-feather'
import Header from '../components/Header'
import { useAuth } from '../utils/AuthContext'

const Room=()=>{
    const {user} = useAuth()

    const [messages,setMessages]=useState([])
    const [messageBody,setMessageBody]=useState('')

    const getMessage=async ()=>{
        const response=await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID_MESSAGES,
            [Query.orderAsc('$createdAt'),Query.limit(20)]
        );
        console.log(response)
        setMessages(response.documents)
    }

    const deleteMessage=async(id)=>{
        const response=await databases.deleteDocument(DATABASE_ID,COLLECTION_ID_MESSAGES,id);
        //setMessages(prevState=>prevState.filter(message=>message.$id!==id))
    }
    const handleSubmit=async (e)=>{
        e.preventDefault()

        let payload={
            user_id:user.$id,
            user_name:user.name,
            body:messageBody
        }
        let permissions=[
            Permission.write(Role.user(user.$id))
        ]
        const response=await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID_MESSAGES,
            ID.unique(),
            payload,
            permissions
        )
        console.log(response)
        //setMessages(prevState=>[...prevState,response])
        setMessageBody('')
    }

    useEffect(()=>{
        getMessage()

        const unsubscribe=client.subscribe(`databases.${DATABASE_ID}.collections.${COLLECTION_ID_MESSAGES}.documents`,
        response => {
        console.log("Real time:",response)
        if(response.events.includes("databases.*.collections.*.documents.*.create")){
            console.log("A message was created")
            setMessages(prevState=>[...prevState,response.payload])
        }
        if(response.events.includes("databases.*.collections.*.documents.*.delete")){
            console.log("A message was deleted")
            setMessages(prevState=>prevState.filter(message=>message.$id!==response.payload.$id))
        }
        }
        )
        return ()=>{
            unsubscribe()
        }
    },[])



    return(
        <main className="container">
            <Header/>
            <div className="room--container">
                
                <div>
                    {
                        messages.map((message)=>{
                            return(
                                <div key={message.$id} className="message--wrapper">
                                    <div className="message--header">
                                        <p>
                                            {message?.user_name?(
                                                <span>{message.user_name}</span>
                                            ):(<span>Anonymous user</span>)}
                                            <small className="message-timestamp">{new Date(message.$createdAt).toLocaleString()}</small>
                                        </p>
                                        {message.$permissions.includes(`delete(\"user:${user.$id}\")`)&&(
                                            <Trash2 
                                            className='delete--btn'
                                            onClick={()=>{deleteMessage(message.$id)}}
                                        />
                                        )}
                                        
                                        
                                    </div>
                                    <div className={message.user_id===user.$id?"message--body--owner":"message--body"}>
                                        <span className="">{message.body}</span>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
                <form onSubmit={handleSubmit} id="messge--form">
                    <div>
                        <textarea
                            required
                            maxLength="1000"
                            placeholder="Say something..."
                            value={messageBody}
                            onChange={(e)=>{setMessageBody(e.target.value)}}>
                        </textarea>
                    </div>
                    <div className="send-btn--wrapper">
                        <div>
                            <input className="btn btn--secondary" type="submit" value="Send"/> 
                        </div>
                    </div>
                </form>
            </div>
        </main>
    )
}
export default Room