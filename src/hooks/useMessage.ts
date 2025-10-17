import { useState } from 'react';

type MessageType = 'warning' | 'error' | 'info' | 'success';

interface MessageConfig {
    message: string;
    type?: MessageType;
    title?: string;
}

export default function useMessage() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<MessageType>('info');
    const [title, setTitle] = useState('');

    const showMessage = (config: MessageConfig) => {
        setMessage(config.message);
        setType(config.type || 'info');
        setTitle(config.title || '');
        setIsOpen(true);
    };

    const hideMessage = () => {
        setIsOpen(false);
    };

    return {
        showMessage,
        hideMessage,
        messageState: {
            isOpen,
            message,
            type,
            title,
            onClose: hideMessage
        }
    };
}