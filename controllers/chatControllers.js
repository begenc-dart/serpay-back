const { Op } = require("sequelize")

module.exports = (io) => {
    const { Chats, Userfriends, Users } = require("../models")
    let users = {}
    let adminOnline = false
    let adminSocket
    let isNewMessage = false
    const express = require("express");
    io.on('connection', async(socket) => {
        socket.on("login", async({ user_id }) => {
            console.log("login",user_id)
            const user = await Users.findOne({ where: { user_id } })
            users[socket.id] = socket.id
            await user.update({ lastSocketId: socket.id })
        })
        socket.on('send-chat-message', async({ nickname, message, user_id }) => {
            console.log("send-chat message")
            console.log(nickname,message,user_id)
            const receiving_user = await Users.findOne({ where: { nickname } })
            const sending_user = await Users.findOne({ where: { user_id } })
            let last_message = await Userfriends.findOne({
                where: {
                    [Op.or]: [{
                            [Op.and]: [{
                                    user_id1: user_id
                                },
                                {
                                    user_id2: receiving_user.user_id
                                }
                            ]
                        },
                        {
                            [Op.and]: [{
                                    user_id1: receiving_user.user_id
                                },
                                {
                                    user_id2: user_id
                                }
                            ]
                        }
                    ]
                }
            })
            if (last_message) await last_message.update({ message })
            else last_message = await Userfriends.create({ user_id1: user_id, user_id2: receiving_user.user_id, text: message })
            const chat = await Chats.create({ user_id1: user_id, user_id2: receiving_user.user_id, text: message })
            if (users[receiving_user.lastSocketId]){
                console.log("goni yzyna gitya")
                socket.broadcast.to(receiving_user.lastSocketId).emit("receive-message", { nickname: sending_user.nickname, message })
            } 
        })
        socket.on('disconnect', () => {
            if (adminSocket == socket.id) {
                adminOnline = false
            }
            delete users[socket.id]
        })
    })
    return express
}