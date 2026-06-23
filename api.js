const http = require("http")
const fs = require("fs")
const { json } = require("stream/consumers")
const PORT = 3000

const server = http.createServer((req,res) => {
    console.log(req.method)
    console.log(req.url)
    if(req.method === "POST" && req.url === "/user"){
        let body = ""
        req.on("data", chunck => {
            body += chunck
        })

        req.on("end", () => {
            const newUser = JSON.parse(body)
            fs.readFile("users.json", "utf-8", (err,data) => {
                if(err){
                    res.writeHead(400, {"content-type":"application/json"})
                    return res.end(JSON.stringify({message:"An error occured"}))
                }
                const users = JSON.parse(data)
                const exists = users.find(u => u.email === newUser.email)

                if(exists){
                    res.writeHead(409, {"content-type":"application/json"})
                    return res.end(JSON.stringify({message:"Email already exists."}))
                }

                users.push(newUser)
                fs.writeFile(
                    "users.json", 
                    JSON.stringify(users, null, 2),
                    err => {
                        if(err){
                            res.writeHead(500, {"content-type":"application/json"})
                            return res.end(JSON.stringify({message:"Error writing file."}))
                        }
                        res.writeHead(201, {"content-type":"application/json"})
                        return res.end(JSON.stringify({message:"User added succussfully."}))
                    }
                )
            })
        })
    }
    else if(req.method === "PATCH" && req.url.startsWith("/user/")){
        const parts = req.url.split("/")
        const id = parts[2]

        let body = ""
        req.on("data", chunck => {
            body += chunck
        })

        req.on("end", () => {
            let editedUser = JSON.parse(body)

            fs.readFile("users.json", "utf-8", (err,data) => {
                if(err){
                    res.writeHead(500, {"content-type":"application/json"})
                    return res.end(JSON.stringify({message:"An error occured."}))
                }

                const users = JSON.parse(data)
                const index = users.findIndex(u => u.id === Number(id))

                if(index === -1){
                    res.writeHead(404, {"content-type":"application/json"})
                    return res.end(JSON.stringify({message:"This user doesn't exist."}))
                }

                users[index] = {
                    ...users[index],
                    ...editedUser
                }

                fs.writeFile("users.json", 
                    JSON.stringify(users,null,2),
                    err => {
                        if(err){
                            res.writeHead(500, {"content-type":"application/json"})
                            return res.end(JSON.stringify({message:"An error occured."}))
                        }

                        res.writeHead(200, {"content-type":"application/json"})
                        return res.end(JSON.stringify({
                            message:"User has been updated.",
                            user:users[index]
                        }))
                    }
                )
            })
        })
    }
    else if(req.method === "DELETE" && req.url.startsWith("/user/")){
        const parts = req.url.split("/")
        const id = parts[2]

        fs.readFile("users.json", "utf-8", (err,data) => {
            if(err){
                res.writeHead(500, {"content-type":"application/json"})
                return res.end(JSON.stringify({message:"An error occured"}))
            }


            const users = JSON.parse(data)
            const index = users.findIndex(
                user => user.id === Number(id)
            )

            if(index === -1){
                res.writeHead(404, {"content-type":"application/json"})
                return res.end(JSON.stringify({message:"User not found"}))
            }
            users.splice(index,1)

            fs.writeFile("users.json"
                ,JSON.stringify(users,null,2),
                err => {
                    if(err){
                        res.writeHead(500, {"content-type":"application/json"})
                        return res.end(JSON.stringify({message:"An error occured"}))
                    }
                    res.writeHead(200, {"content-type":"application/json"})
                    return res.end(JSON.stringify({message:"This user has been deleted"}))
                }
            )

        })
        

    }
    else if(req.method === "GET" && req.url === "/user"){
        fs.readFile("users.json", "utf-8", (err, data) => {
            if(err){
                res.writeHead(500, {"content-type":"application/json"})
                return res.end(JSON.stringify({message:"There are no users to return"}))
            }
            res.writeHead(200, {"content-type":"application/json"})
            return res.end(data)
        })
    }
    else if(req.method === "GET" && req.url.startsWith("/user/")){
        const parts = req.url.split("/")
        const id = Number(parts[2])

        fs.readFile("users.json", "utf-8", (err,data) => {
            if (err){
                res.writeHead(500, {"content-type":"application/json"})
                return res.end(JSON.stringify({message:"An error occured"}))
            }

            const users = JSON.parse(data)
            const index = users.findIndex(
                user => user.id === id
            )

            if(index === -1){
                res.writeHead(404, {"content-type":"application/json"})
                return res.end(JSON.stringify({message:"User not found"}))
            }

            res.writeHead(200, {"content-type":"application/json"})
            return res.end(JSON.stringify(users[index]))
        })
    }
    else{
        res.writeHead(404, {"content-type":"application/json"})
        return res.end(JSON.stringify({message:"Unfound Endpoint"}))
    }
})

server.listen(3000, () => console.log(`Server is running on port ${PORT} at ${new Date()}`))
