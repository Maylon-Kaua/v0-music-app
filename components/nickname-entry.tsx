import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const NicknameEntry: React.FC = () => {
    const [nickname, setNickname] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nickname.trim() === '') {
            setError('Nickname is required.');
            setSuccess(false);
        } else if (nickname.length < 3) {
            setError('Nickname must be at least 3 characters long.');
            setSuccess(false);
        } else {
            setError('');
            setSuccess(true);
            // Here you can handle form submission (e.g., send data to the server)
            console.log('Nickname submitted:', nickname);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="nickname">Enter Nickname</label>
                <input
                    type="text"
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Your nickname"
                />
                <button type="submit">Submit</button>
            </form>
            {error && (
                <div style={{ color: 'red' }}>
                    <XCircle style={{ marginRight: '5px' }} />
                    {error}
                </div>
            )}
            {success && (
                <div style={{ color: 'green' }}>
                    <CheckCircle style={{ marginRight: '5px' }} />
                    Nickname submitted successfully!
                </div>
            )}
        </div>
    );
};

export default NicknameEntry;
