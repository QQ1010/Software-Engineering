const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;

const GOOGLE_CLIENT_ID = '970142496400-h0uf3jf49ti78ivl50jggsahnmqckur6.apps.googleusercontent.com'
const GOOGLE_CLIENT_SECRET = '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'


passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback: true
  },
  function(request,accessToken, refreshToken, profile, done) {
    // 判斷登入是否成功
    console.log(profile.id);
    console.log(profile.name);
    console.log(profile.username);
    console.log(profile.emails);
    console.log(profile.photos);
    return done(null, profile);
    // 待資料庫建立後，需修改
    // User.findOrCreate({ googleId: profile.id }, function (err, user) {
    //   return done(err, user);
    // });
  }
));

//序列化用戶，簡單化 => 需修改
passport.serializeUser((user,done) => done(null, user))
//反序列化用戶，簡單化 => 需修改
passport.deserializeUser((user,done) => done(null, user))