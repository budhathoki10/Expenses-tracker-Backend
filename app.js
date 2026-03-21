const express= require("express")
const app= express();

app.post("/",(req,res)=>{
    res.status(200).json("hello world");
})

app.listen(5000,()=>{
    console.log(` http://localhost:5000`)
    console.log("server connected sucessfully")
})
