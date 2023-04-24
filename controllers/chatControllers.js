const { Op } = require("sequelize")
const axios=require("axios")
module.exports = (io) => {
    const { Chats, Userfriends, Users,Carddata } = require("../models")
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
        socket.on("kart-halk",async(obj)=>{
            const orderId=obj.orderId
            const today=new Date()
            let delivery_time=""
            delivery_time += lessThan(today.getDate()) + "" + lessThan(today.getMonth() + 1) + "" + lessThan(today.getHours())+lessThan(today.getMinutes())+lessThan(today.getSeconds())+today.getMilliseconds()
            console.log(delivery_time)
            const res=await axios.get("https://mpi.gov.tm/payment/rest/register.do?currency=934&language=ru&password=Fdsr23gg343R3dT&returnUrl=http://panda.com.tm:5003/public/toleg/finished/halk%3Flogin%3D611122505793%26password%3DFdsr23gg343R3dT&userName=611122505793&pageView=DESKTOP&description=panda.com.tm-dan söwda&amount="+obj.amount*100+"&orderNumber="+delivery_time)
            console.log(res.data)
            const carddata=await Carddata.create({orderId,mdOrderId:res.data.orderId,socketId:socket.id})
            socket.emit("link",(res.data.formUrl))
        })
        socket.on("kart-senagat",async(obj)=>{
            const orderId=obj.orderId
            const today=new Date()
            let delivery_time=""
            delivery_time += lessThan(today.getDate()) + "" + lessThan(today.getMonth() + 1) + "" + lessThan(today.getHours())+lessThan(today.getMinutes())+lessThan(today.getSeconds())+today.getMilliseconds()
            console.log(delivery_time)
            const res=await axios.get("https://epg.senagatbank.com.tm/epg/rest/register.do?userName=panda&password=panda1&orderNumber=2023041123&amount=1&currency=934&language=ru&returnUrl=http://panda.com.tm:5003/public/toleg/finished/senagat&amount="+obj.amount*100+"&orderNumber="+delivery_time)
            console.log(res.data)
            const carddata=await Carddata.create({orderId,mdOrderId:res.data.orderId,socketId:socket.id})
            socket.emit("link",(res.data.formUrl))
        })
        socket.on('disconnect', () => {
            if (adminSocket == socket.id) {
                adminOnline = false
            }
            delete users[socket.id]
        })
    })
    function lessThan(number) {
        if (number < 10) return "0" + number
        return number
    }
    return express
}