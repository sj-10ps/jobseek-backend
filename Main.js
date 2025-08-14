const express=require('express')
const db=require('./config/config')
const cors=require('cors')
const path=require('path')
const http = require('http');  
const { Server } = require('socket.io');    

db()
const publicroute=require('./routes/Public')
const userroute=require('./routes/User')
const companyroute=require('./routes/Company')
const adminroute=require('./routes/Admin')
const app=express()
const server=http.createServer(app)







app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors({
  origin: '*',
  credentials: true                
}));
app.use('/media',express.static(path.join(__dirname,'media')))
app.use('',publicroute)
app.use('',userroute)
app.use('',companyroute)
app.use('',adminroute)


const connectedusers={}
const io=new Server(server,{
    cors:{
        origin:'*',
        methods:["GET","POST"],
         credentials: true 
    }
})

io.on("connection",(socket)=>{
    console.log("User connected",socket.id)

    socket.on("register",(userid)=>{
        connectedusers[userid]=socket.id
        console.log(`user ${userid} registered with ${socket.id}`)
    })

    socket.on("send_message",(data)=>{
        const {senderId, receiverId, text}=data
        const recieversocketid=connectedusers[receiverId]
        if(recieversocketid){
            io.to(recieversocketid).emit('receive_message',{
               senderId, receiverId, text

            })
            console.log(senderId,receiverId,text)
        }else{
             console.log('❌ Receiver not connected:', recieversocketid);
        }    
    })
        socket.on('disconnect',()=>{
        console.log("user disconnected")
        for (let i in connectedusers){
            if(connectedusers[i]===socket.id){
                delete connectedusers[i];
                break
            }
        }
    })
})



server.listen(process.env.PORT,()=>{
    console.log(`http://localhost:${process.env.PORT}`)
})