const fs = require("fs")
const zlib = require("zlib")

//1
const readStream = fs.createReadStream("./big.txt", {
    encoding:"utf-8"
})

readStream.on("data", (chunck) => {
    console.log(chunck)
})

readStream.on("end", () => {
    console.log("Finished reading")
})

readStream.on("error", (error) => {
    console.log(error.message)
})

//2
const readStream = fs.createReadStream("./source.txt", {
    encoding:"utf-8"
})
const writeStream = fs.createWriteStream("./dest.txt", {
    encoding:"utf-8"
})

readStream.on("data", (chunck) => {
    writeStream.write(chunck)
})
readStream.on("end", () => {
    console.log("File copied using streams")
})

//3
const readStream = fs.createReadStream("data.txt")
const writeStream = fs.createWriteStream("data.txt.gz")
const gzip = zlib.createGzip()

readStream
    .pipe(gzip)
    .pipe(writeStream)

readStream.on("finish", () => {
    console.log("File compressed successfully")
})