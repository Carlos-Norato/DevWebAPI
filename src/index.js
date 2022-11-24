require("dotenv").config();
const {sign} = require("jsonwebtoken");
const express = require("express");
const cors = require('cors');
const app = express();
const authenticate = require("./middleware/auth");
const fs = require("fs");   
const port =  process.env.PORT || 3333; 

app.use(express.json());
app.use(cors());

app.post("/cadastro", (request, response)=>{

    const {username, password} = request.body;  

    const data = fs.readFileSync("./database/users.json", "utf-8");
    const userRepository = JSON.parse(data.toString());

    const user = userRepository.find(
        (user) => user.username === username
    );

    if (user != undefined) {
        error = {"erro" : "Nome de usuario ja cadastrado"};
        return response.json({error});
    };

    const dataSequence = fs.readFileSync("./database/sequence.json", "utf-8");
    let sequence = JSON.parse(dataSequence.toString());
    sequence.usuario += 1;

    userRepository.push({"id": sequence.usuario, "username": username, "password": password});

    fs.writeFileSync("./database/users.json", JSON.stringify(userRepository), "utf-8");
    fs.writeFileSync("./database/sequence.json", JSON.stringify(sequence), "utf-8");

    return response.status(201).json({});

});

app.post("/login", (request, response)=> {

    const {username, password} = request.body;  

    const data = fs.readFileSync("./database/users.json", "utf-8");
    const userRepository = JSON.parse(data.toString());

    const user = userRepository.find(
        (user) => user.username === username
    );

    if (user == undefined || user.password != password) {
        error = {"erro" : "Login ou senha invalidos"};
        return response.json({error});
    };


    const token = sign({username }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRESIN,
    });
    return response.json({user, token});
});

app.get("/post", authenticate, (request, response) => {
    
    const data = fs.readFileSync("./database/posts.json", "utf-8");
    const responsePost = JSON.parse(data.toString());



    return response.json({responsePost});
}); 

app.get("/meusPost", authenticate, (request, response) => {
    const {username} = request.user;
    
    const data = fs.readFileSync("./database/posts.json", "utf-8");
    const postRepository = JSON.parse(data.toString());

    const responsePost = postRepository.filter((post) => post.autor === username);

    return response.json({responsePost});
});

app.delete("/post/:id", authenticate, (request, response)=>{
    const {username} = request.user;
    const idPost = request.params.id;
    
    const data = fs.readFileSync("./database/posts.json", "utf-8");
    const postRepository = JSON.parse(data.toString());
   
    const posts = postRepository.filter( function(post) {
        if (post.autor == username) {
            return post.id != idPost;
        }
        return post;
    });
    

    fs.writeFileSync("./database/posts.json", JSON.stringify(posts), "utf-8");

    return response.json({});
});


app.put("/post/:id", authenticate, (request, response)=>{
    const {username} = request.user;
    const idPost = request.params.id;
    const conteudo = request.body.conteudo;

    const data = fs.readFileSync("./database/posts.json", "utf-8");
    const postRepository = JSON.parse(data.toString());
   
    const posts = []

    postRepository.forEach(post => {
        if (post.autor == username && post.id == idPost) {
            post = {"id" : post.id, "conteudo" : conteudo, "autor" : post.autor};
        }
        posts.push(post);
    });
    
    fs.writeFileSync("./database/posts.json", JSON.stringify(posts), "utf-8");

    return response.json({});
});

app.post("/post", authenticate, (request, response) => {
    const {username} = request.user;
    const conteudo = request.body.conteudo;

    const data = fs.readFileSync("./database/posts.json", "utf-8");
    const postRepository = JSON.parse(data.toString());

    const dataSequence = fs.readFileSync("./database/sequence.json", "utf-8");
    let sequence = JSON.parse(dataSequence.toString());
    sequence.post += 1;


    postRepository.push({"id": sequence.post, "conteudo" : conteudo, "autor" : username});

    fs.writeFileSync("./database/posts.json", JSON.stringify(postRepository), "utf-8");
    fs.writeFileSync("./database/sequence.json", JSON.stringify(sequence), "utf-8");

    return response.status(201).json({});  
    
});



app.listen(port , () => {
  
});