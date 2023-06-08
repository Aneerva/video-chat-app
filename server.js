const express = require("express");
const app = express();
const server = require("http").Server(app);
app.set("view engine", "ejs");
app.use(express.static("public"));

const { v4: uuidv4 } = require("uuid");

const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.use("/peerjs", peerServer);
var nodeMailler = require('nodemailler')
const transportrer = nodeMailler.createTransport({
    port:587,
    host:'smtp.gmail.com',
    auth:{
        user:'aneervajaiswal07@gmail.com',
        pass:'besspffdnnbkktjz',
    },
    secure:true
})
app.post('/send-mail',(req,res)=>{
    const to = req.body.to
    const url = req.body.url
    const mailData = {
        from:'aneervajaiswal07@gmail.com',
        to: to,
        subject:'Join The Video Chat With Me :)',
        html:`<p>Hey There,</p><p>Come & Join Me For A Video Chat Here!! ${url}</p>`
    }
transportrer.sendMail(mailData,(error,info)=>{
    if(error){
        return console.log(error)
    }
    res.status(200).send({message:'invitationSend',message_id:info.messageId})
})
})
app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
    res.render("index", { roomId: req.params.room });
});

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        io.to(roomId).emit("user-connected", userId);
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
    });
});

server.listen(process.env.PORT || 3030);
