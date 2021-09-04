//import
import express, { response } from 'express';
import mongoose from 'mongoose';
// import Pusher from 'pusher';
import cors from 'cors';
// import mongoData from './mongoData.js';
import User from './user.js'
import {OAuth2Client} from 'google-auth-library'
import jwt  from 'jsonwebtoken'; //jwt for user stay logged in

const client = new OAuth2Client("383363631691-0qd1fq1s2ee1r0drnnkpa1649mser2fi.apps.googleusercontent.com")

//app config
const app = express()
const port = process.env.PORT || 5000

// const pusher = new Pusher({
//     appId: "1207516",
//     key: "16f8cc1281322f66545a",
//     secret: "1dfa6a1eaeaf5a3f3797",
//     cluster: "ap2",
//     useTLS: true
//   });

//middlewares
app.use(cors())
app.use(express.json())

//db config
const mongoURI = 'mongodb+srv://user:user123@cluster1.u9a9g.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

mongoose.connect(mongoURI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connection.once('open',()=>{
    console.log('DB Connected')

    // const changeStream = mongoose.connection.collection('conversations').watch()

    // changeStream.on('change', (change) => {
    //     if (change.operationType === 'insert') {
    //         pusher.trigger('chats', 'newChat', {
    //             'change': change
    //         })
    //     } else if (change.operationType === 'update') {
    //         pusher.trigger('messages', 'newMessage', {
    //             'change': change
    //         })
    //     } else {
    //         console.log('Error triggering Pusher...')
    //     }
    // })
})

//api routes
app.get('/', (req, res) => res.status(200).send('Hello Programmers!'))

app.post('/googlelogin', (req, res) => {
    const {tokenId} = req.body;
    client.verifyIdToken({idToken: tokenId, audience: "383363631691-0qd1fq1s2ee1r0drnnkpa1649mser2fi.apps.googleusercontent.com"}).then(response => {
        const{email_verified, name, email} = response.payload;
        console.log(response.payload);

        if(email_verified) {
            User.findOne({email}).exec((err, user) => {
                if(err){
                    return res.status(400).json({
                        error: "Something went wrong ..."
                    })
                }else {
                    if(user) {
                        const token = jwt.sign({_id: user._id}, 'test', { expiresIn: "1h"});
                        const {_id, name, email} = user;

                        res.json({
                            token,
                            user: {_id, name, email}
                        })
                    } else {
                        let password = email;
                        let newUser = new User({name, email, password});
                        newUser.save((err, data) => {
                            if(err) {
                                return res.status(400).json({
                                    error: "Something went wrong... in creating user"
                                })
                            }
                            const token = jwt.sign({_id: data._id}, 'test', { expiresIn: "1h"});
                            const {_id, name, email} = newUser;

                            res.json({
                                token,
                                user: {_id, name, email}
                            })
                        })
                    }
                }
            })
        }
    })
})

// app.post('/new/conversation', (req, res) => {
//     const dbData = req.body

//     mongoData.create(dbData, (err, data) => {
//         if (err) {
//             res.status(500).send(err)
//         } else {
//             res.status(201).send(data)
//         }
//     })
//     console.log()
// })

// app.post('/new/message', (req, res) => {
//     mongoData.update(
//         { _id: req.query.id },
//         { $push: { conversation: req.body }},
//         (err, data) => {
//             if (err) {
//                 console.log('Error saving message...')
//                 console.log(err)

//                 res.status(500).send(err)
//             } else {
//                 res.status(201).send(data)
//             }
//         }
//     )
// })

// app.get('/get/conversationList', (req, res) => {
//     mongoData.find((err, data) => {
//         if (err) {
//             res.status(500).send(err)
//         }else {
//             data.sort((b, a) => {
//                 return a.timestamp - b.timestamp;
//             });

//             let conversations = []

//             data.map((conversationData) => {
//                 const conversationInfo = {
//                     id: conversationData._id,
//                     name: conversationData.chatName,
//                     timestamp: conversationData.conversation[0].timestamp
//                 }

//                 conversations.push(conversationInfo)
//             })

//             res.status(200).send(conversations)
//         }
//     })
// })

// app.get('/get/conversation', (req, res) => {
//     const id = req.query.id

//     mongoData.find({_id: id}, (err, data) => {
//         if(err) {
//             res.status(500).send(err)
//         }else {
//             res.status(200).send(data)
//         }
//     })
// })

// app.get('/get/lastMessage', (req, res) => {
//     const id = req.query.id

//     mongoData.find({_id: id}, (err, data) => {
//         if(err) {
//             res.status(500).send(err)
//         } else {
//             let convData = data[0].conversation

//             convData.sort((b, a) => {
//                 return a.timestamp - b.timestamp;
//             })

//             res.status(200).send(convData[0])
//         }
//     })
// })

//listen
app.listen(port, () => console.log(`listening on localhost:${port}`))