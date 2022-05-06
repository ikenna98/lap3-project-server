const dotenv = require('dotenv');
dotenv.config();
const db = require('./dbConfig');
// require('./socket');
const app = require("./app");
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});

// const server = require('./app');
// const io = require("socket.io")(server , {
//     cors: {
//       origin: '*',
//     }
// });

const port = process.env.PORT || 5001;
let sendScore;

io.on('connection', socket => {
    console.log("New connection has been made..."); // runs when client first connects

    // get total number of client connections
    const participantCount = io.engine.clientsCount;

    // send event only to new connecting client
    socket.emit('admin-message', 'Hi there, new fact hunter!');
    // send event to all other clients (not new connecting client)
    socket.broadcast.emit('admin-message', `A new fact hunter has arrived!`);
    // send event to all clients
    io.emit('admin-message', `There ${participantCount === 1 ? "is 1 fact hunter": `are ${participantCount} fact hunters`} here now!`);

    io.emit('client-number',participantCount);

    // data param is an object of values sent from the form e.g: {roomName: e.target.roomName.value, username: e.target.username.value, creator: false}
    socket.on("join-room", data => {
        // When a user joins a new room removes them from their previous room
        Array.from(socket.rooms)
            .filter((r) => r !== socket.id)
            .forEach((r) => socket.leave(r));

        if ( (!io.sockets.adapter.rooms.has(data.roomName) && !data.creator) || (io.sockets.adapter.rooms.has(data.roomName) && data.creator) ){
            socket.emit('room-exists', false)
            console.log('cannot create/join')
        } else {
            socket.emit('room-exists', true)
        
            socket.join(data.roomName);
            console.log(`${data.username} joined ${data.roomName}`);
            console.log(socket.rooms);
            console.log(socket.id);

            // url param is a string that contains the API link
            socket.on('room-url', url => {
                socket.broadcast.to(data.roomName).emit('room-url', url)
                console.log(url)
            });

            // Integrating lobby leaderboard:
            // socket.emit('socket-id', socket.id)
            // socket.on('room-id', id => {
            //     socket.broadcast.to(data.roomName).emit('room-id', id)
            // });
               
            socket.on('new-msg', (message) => {
                socket.broadcast.to(data.roomName).emit('new-msg', `${data.username}: ${message}`);
            })
            // Tell everyone a user joined
            socket.broadcast.to(data.roomName).emit("join-room", `${data.username} has joined the room!`);
            console.log(io.sockets.adapter.rooms);
            // Notifies everyone that a specific user has left
            socket.on('start-quiz', () => {
                socket.broadcast.to(data.roomName).emit("start-quiz", `${data.username} has started their quiz!`)
            });
            // Score is sent to server, username and score are emitted
            socket.on('end-quiz', async score => {
                sendScore = await db.query(`INSERT INTO users (username, score) VALUES ($1, $2) RETURNING *;`, [ data.username, score ]);
                socket.broadcast.to(data.roomName).emit("end-quiz", {username: data.username, score: score})
            });
            
            socket.on('disconnect', () => {
                io.to(data.roomName).emit("join-room", `${data.username} has left!`)
            })
        } 
      });

    socket.on("disconnect", () => { // runs when client disconnects
        console.log("Goodbye...");
    });
});

server.listen(port, () => console.log(`Express is running on port ${port}`));

module.exports = {sendScore};

// io.on('connection', socket => {
//     console.log("New connection has been made..."); // runs when client first connects

//     // get total number of client connections
//     const participantCount = io.engine.clientsCount;

//     // send event only to new connecting client
//     socket.emit('admin-message', 'Hi there, new fact hunter!');
//     // send event to all other clients (not new connecting client)
//     socket.broadcast.emit('admin-message', `A new fact hunter has arrived!`);
//     // send event to all clients
//     io.emit('admin-message', `There ${participantCount === 1 ? "is 1 fact hunter": `are ${participantCount} fact hunters`} here now!`);

//     io.emit('client-number',participantCount);

//     socket.on("join-room", async data => {
//         // When a user joins a new room removes them from their previous room
//         Array.from(socket.rooms)
//             .filter((r) => r !== socket.id)
//             .forEach((r) => socket.leave(r));
//         await socket.join(data.roomName);
//         console.log(`${data.username} joined ${data.roomName}`);
//         console.log(socket.rooms);
//         socket.rooms.has(data.roomName) ? console.log('Successfully entered room!') : console.log('Not in room!');
//         // Tell everyone a user joined
//         socket.broadcast.to(data.roomName).emit("join-room", `${data.username} has joined the room!`);
//         console.log(io.sockets.adapter.rooms);
//         // Notifies everyone that a specific user has left
//         socket.on('disconnect', () => {
//             io.to(data.roomName).emit("join-room", `${data.username} has left!`)
//         })
//       });

//     socket.on("disconnect", () => { // runs when client disconnects
//         // io.to(data.roomName).emit("join-room", `${data.username} has left!`)
//         console.log("Goodbye...");
//     });
// });

// server.listen(port, () => {
//     console.log(`Open for play on port ${port}!`)
// });
