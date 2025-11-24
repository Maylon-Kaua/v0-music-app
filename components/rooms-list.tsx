import React, { useState } from 'react';

const RoomsList: React.FC = () => {
    const [rooms, setRooms] = useState<{ id: number, name: string, memberCount: number }[]>([]);
    const [newRoomName, setNewRoomName] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleLogout = () => {
        // Add logout logic here
        console.log('User logged out');
    };

    const handleCreateRoom = () => {
        if (newRoomName) {
            const newRoom = {
                id: rooms.length + 1,
                name: newRoomName,
                memberCount: 0
            };
            setRooms([...rooms, newRoom]);
            setNewRoomName('');
            setIsDialogOpen(false);
        }
    };

    const handleJoinRoom = (roomId: number) => {
        // Add logic to join the room
        console.log(`Joined room with ID: ${roomId}`);
    };

    return (
        <div>
            <h1>Available Rooms</h1>
            <ul>
                {rooms.map(room => (
                    <li key={room.id}>
                        {room.name} - {room.memberCount} members
                        <button onClick={() => handleJoinRoom(room.id)}>Join Room</button>
                    </li>
                ))}
            </ul>
            <button onClick={() => setIsDialogOpen(true)}>Create New Room</button>
            <button onClick={handleLogout}>Logout</button>

            {isDialogOpen && (
                <div>
                    <h2>Create New Room</h2>
                    <input 
                        type="text" 
                        value={newRoomName} 
                        onChange={(e) => setNewRoomName(e.target.value)} 
                        placeholder="Room Name" 
                    />
                    <button onClick={handleCreateRoom}>Create Room</button>
                    <button onClick={() => setIsDialogOpen(false)}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default RoomsList;