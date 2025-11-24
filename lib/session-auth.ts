// session-auth.ts

interface User {
    nickname: string;
    room: string;
}

class SessionAuth {
    private users: User[] = [];

    public joinRoom(nickname: string, room: string): string {
        const existingUser = this.users.find(user => user.nickname === nickname);
        if (existingUser) {
            existingUser.room = room;
            return `${nickname} has joined the room ${room}.`;
        } else {
            this.users.push({nickname, room});
            return `${nickname} has created/joined the room ${room}.`;
        }
    }

    public getUsersInRoom(room: string): User[] {
        return this.users.filter(user => user.room === room);
    }

    public leaveRoom(nickname: string): string {
        const userIndex = this.users.findIndex(user => user.nickname === nickname);
        if (userIndex !== -1) {
            const user = this.users[userIndex];
            this.users.splice(userIndex, 1);
            return `${nickname} has left the room ${user.room}.`;
        } else {
            return `${nickname} is not in any room.`;
        }
    }
}

// Usage example:
const auth = new SessionAuth();
console.log(auth.joinRoom('Alice', 'Room1')); // Alice has created/joined the room Room1.
console.log(auth.joinRoom('Bob', 'Room1')); // Bob has created/joined the room Room1.
console.log(auth.getUsersInRoom('Room1')); // Get users in Room1.
console.log(auth.leaveRoom('Alice')); // Alice has left the room Room1.