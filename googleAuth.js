const express = require('express')
const axios = require('axios')
const User = require('./models/userModel')
const app = express()


const CLIENT_ID = '433824331-abbdk6cfo4spcrs1c53tseob040ajsfh.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://rushgamez.online/auth/google/callback';


app.get('/auth/google',(req,res)=>{
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;
    res.redirect(url)
});


app.get('/auth/google/callback',async (req,res)=>{
    const {code} = req.query;

    try {
        const { data } = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code',
          });

          const { access_token, id_token } = data;
       
        const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
        });
            const exists = await User.findOne({email:profile.email})
            if(!exists){
                const newUser = new User({
                    password:profile.id,
                    name:profile.name,
                    email:profile.email,
                    is_verified:true
                })
                const user = await newUser.save()
                req.session.user_id = user._id
            }else{
                let user = await User.findOne({email:profile.email})
                req.session.user_id = user._id
                
            }
            
        res.redirect('/');
    } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
            console.error('Error:', error.response.data.error);
        } else {
            console.error('Error occurred:', error.message);
        }
        
        res.redirect('/login');
    }
})

app.get('/logout',(req,res)=>{
    res.redirect('/login')
})

module.exports = app