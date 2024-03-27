import express from 'express';
import http from 'http'
import dotenv from 'dotenv'
import router from '../routers/index.js';
dotenv.config()
import connectDb from '../utils/connectDb.js';
import cors from 'cors'
import ChatModel from '../schemas/chats.js';
import MessageModel from '../schemas/messages.js';
import UserModel from '../schemas/users.js'
import AdminModel from '../schemas/admin.js'
import WorkerModel from '../schemas/workers.js'
import { Server as SocketIo } from 'socket.io'


const app = express()
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

app.use(cors('*'))
app.use('/uploads', express.static('uploads'))

app.use(express.json())

app.use('/api', router)





connectDb()
const io = new SocketIo(server,  {pingTimeout : 1000, cors : {origin : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"]}});
// let users = [];




function findSingleObject(obj1, obj2, obj3) {
    const objects = [obj1, obj2, obj3];
  
    // Obyektlarni sanab quyidagi shart orqali tekshirish: faqat 1 obyekt, va u null emas
    const nonNullObjects = objects.filter(obj => obj !== null && typeof obj === 'object');
  
    // Agar faqatgina bir obyekt topilsa, u qaytariladi. Aks holda null.
    return nonNullObjects.length === 1 ? nonNullObjects[0] : null;
  }


  io.on('connection', async (socket) => {  
    console.log('Client connected', socket.id);
     
  
    
    // ...
    
    socket.on('addUser', async (userId) => {
        try {
            // Barcha userlar
            const users = await UserModel.find();
            const admins = await AdminModel.find();
            const workers = await WorkerModel.find();
         
            // Barcha foydalanuvchilar (admin, worker, user)
            const allUsers = [...admins, ...workers, ...users].filter(el => el._id != userId);
    
            // Userlar bilan adminning oldin chatini tekshirish va o'zgartirish
            for (const user of allUsers) {
                // User va userId orqali chatni tekshirish
                const existingChat = await ChatModel.findOne({ members: { $all: [user._id, userId] } });
    
                // Agar chat topilmagan bo'lsa yaratamiz
                if (!existingChat) {
                    const newChat = new ChatModel({
                        members: [user._id, userId]
                    });
    
                    await newChat.save();
                } else {
                    return
                    // Agar chat mavjud bo'lsa admin va user o'rtasidagi chatni o'zgartiramiz (masalan, yangi xabarlar qo'shish)
                    // Bu qismni shunday o'zgartirishingiz mumkin, sizning biznes logikangizga qarab
                    // existingChat.someUpdateMethod(); 
                }

                if(user.active_id){
                    if(user.active_id === socket.id){
                        user.active = true;
                        user.lastOnline = new Date();
                        await user.save()
                    }

                    socket.join(user.active_id)
                }
            }
            
    
            io.emit('getUsers', allUsers);
        } catch (error) {
            console.error('Error while fetching users:', error);
        }
    });
    




    

    socket.on('sendMessage', async ({ sender, receiver, message, chat }) => {
        const users = await UserModel.find();
        const admins = await AdminModel.find();
        const workers = await WorkerModel.find();
     
        // Barcha foydalanuvchilar (admin, worker, user)
        const allUsers = [...admins, ...workers, ...users];
         allUsers.forEach(el=>el.active_id = socket.id)
        // Ushbu qismini oldingi variantni o'zgartirish orqali tekshirishni boshqarish
        const senderUser = await UserModel.findById(sender);
        const senderTeacher = await WorkerModel.findById(sender);
        const senderAdmin = await AdminModel.findById(sender);

        const resultSender = findSingleObject(senderUser, senderTeacher, senderAdmin);

        const receivers = allUsers.find(user => user?._id == receiver);
        const senders = allUsers.find(user => user._id == sender);
        console.log(receivers, senders)

        if (receivers) {
            io.to(receivers?.active_id).to(senders?.active_id).emit('getMessages', {
                sender,
                message,
                chat,
                receiver,
                user: {
                    _id: resultSender?._id,
                    username: resultSender?.username,
                    email: resultSender?.email,
                    phone: resultSender?.phone,
                    img_path: resultSender?.img_path,
                    info: resultSender?.info
                }
            });
        } 
        else {
            io.to(senders?.active_id).emit('getMessages', {
                sender,
                message,
                chat,
                receiver,
                user: {
                    _id: resultSender?._id,
                    username: resultSender?.username,
                    email: resultSender?.email,
                    phone: resultSender?.phone,
                    img_path: resultSender?.img_path,
                    info: resultSender?.info
                }
            });
        }
    });


    socket.on('disconnect', async () => {
        console.log('Client disconnected');

        // User socketdan chiqib ketgan bo'lsa, active ni false qilamiz
        const user = await UserModel.findOne({ active_id: socket.id });
        if (user) {
            user.active = false;
            user.active_id = null;
            user.lastOnline = new Date();
            await user.save();
            io.emit('getUsers', await UserModel.find());
        }
    });
});

// await MessageModel.create({chat : "65b6a09f4968ce133f57958f", sender : "6595b0050f664c8291628ed2", message : "Salom", link_file : "Nan"})


   
 server.listen(PORT, console.log(`Server running on PORT : ${PORT}`))


