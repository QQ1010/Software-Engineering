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
const methodOverride = require('method-override');

const initializePassport = require('./passport-config');
const { application } = require('express');
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
server.use(passport.initialize())
server.use(passport.session())
server.use(methodOverride('_method'))

server.get('/', checkAuthenticated , (request, response) => {
    response.render('../views/index.ejs', {name: request.user.name });
})

server.get('/login', checkNotAuthenticated , (request, response) => {
    response.render('../views/login.ejs');
})

// 登入請求處理
server.post('/login', checkNotAuthenticated ,passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true   // 顯示錯誤訊息給使用者
}));

server.get('/register', checkNotAuthenticated , (request, response) => {
    response.render('../views/register.ejs');
})

//註冊請求處理
server.post('/register', checkNotAuthenticated ,async (request, response) => {
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

// 登出
server.delete('/logout', (request, response) => {
    request.logOut();
    response.redirect('/login')
})

// 檢查登入狀況與處理使用者導向
function checkAuthenticated(request, response, next) {
    if(request.isAuthenticated()) {
        return next();
    }
    response.redirect('/login');
}

function checkNotAuthenticated(request, response, next) {
    if(request.isAuthenticated()) {
        return response.redirect('/');
    }
    next()
}

server.listen(3000);