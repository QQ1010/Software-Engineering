if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express');
const server = express();
const bcrypt = require('bcrypt');
// 暫定為本地passport => 需再更改成npm install passport-google-oauth20
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');

const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = [];  // 暫時存取資料，重新整理頁面時會將資料清空 => 之後要在修改連接資料庫

server.set('view-engine','ejs');
server.use(express.urlencoded({ extend: false}));  // 索取url中的資料 for post
server.use(flash());
server.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
server.use(passport.initialize());
server.use(passport.session());

server.get('/', (request, response) => {
    response.render('../views/index.ejs', {name: 'Anila'});
})

server.get('/login', (request, response) => {
    response.render('../views/login.ejs');
})

server.get('/register', (request, response) => {
    response.render('../views/register.ejs');
})

// 登入請求處理
server.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true   // 顯示錯誤訊息給使用者
}));

//註冊請求處理
server.post('/register', async (request, response) => {
    try {
        const hashedPassword = await bcrypt.hash(request.body.password, 10);
        users.push( {
            id: Date.now().toString(),
            name: request.body.name,
            email: request.body.email,
            password: hashedPassword
        })
        response.redirect('/login')     // 註冊成功，將使用者轉至登入畫面
    } catch {
        response.redirect('/register')  //註冊失敗，將使用者重新設定回註冊畫面
    }
    console.log(users);
});

server.listen(3000);