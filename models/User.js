const db = require('../dbConfig');
let {userScore} = require('../server');

class User {
    constructor(data){
        this.username = data.username
        this.score = data.score
    }
    static get all(){
        return new Promise(async (resolve,reject) => {
            try {
                const allUserData = await db.query(`SELECT * FROM users ORDER BY score DESC;`);
                let allUsers = allUserData.rows.map(u => new User(u));
                resolve(allUsers)
            } catch (error) {
                reject('Cannot retrieve all users');
            }
        })
    }

    static addUserData(data) {
        return new Promise(async (resolve, reject) => {
            try {
                let user = userScore;
                let newUser = new User(user.rows[0])
                resolve(newUser)
            } catch (err) {
                reject(`Error creating user: ${err}`)
            }
        })
    }
}

module.exports = User;
