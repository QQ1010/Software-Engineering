const express = require('express');
const server = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const initializePassport = require('./passport-config')
initializePassport(passport);

const users = [];  // 暫時存取資料，重新整理頁面時會將資料清空 => 之後要在修改連接資料庫

server.set('view-engine','ejs');
server.use(express.urlencoded({ extend: false}));  // 索取url中的資料 for post

server.get('/', (request, response) => {
    response.render('index.ejs', {name: 'Anila'});
})

server.get('/login', (request, response) => {
    response.render('login.ejs');
})

server.get('/register', (request, response) => {
    response.render('register.ejs');
})

// 登入請求處理
server.post('/login', (request, response) => {
    request.body.name
});

// 註冊請求處理
server.post('/register', (request, response) => {
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
});

server.listen(3000);