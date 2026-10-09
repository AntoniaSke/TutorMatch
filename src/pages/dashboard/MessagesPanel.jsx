import React, { useEffect, useRef, useState } from "react";
import { auth } from "../../firebase";
import {
    getOrCreateConversation,
    markConversationAsRead,
    sendMessage,
    subscribeToAcceptedRequestContacts,
    subscribeToConversationMessages,
} from "../../services/messageService";
import "./MessagesPanel.css";
import toast from "react-hot-toast";

function MessagesPanel({ userRole, currentUserName }) {
    const currentUser = auth.currentUser;

    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");
    const [loadingContacts, setLoadingContacts] = useState(true);

    const messagesEndRef = useRef(null);
    const selectionRevision = useRef(0);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (!currentUser || !userRole) return;

        const unsubscribe = subscribeToAcceptedRequestContacts(
            currentUser.uid,
            userRole,
            (contactList) => {
                setContacts(contactList);
                setLoadingContacts(false);
            },
            (error) => {
                console.error("Error fetching message contacts:", error);
                setLoadingContacts(false);
            }
        );

        return () => unsubscribe();
    }, [currentUser, userRole]);

    useEffect(() => {
        if (!selectedConversation) return;

        const unsubscribe = subscribeToConversationMessages(
            selectedConversation.id,
            (messageList) => {
                setMessages(messageList);
            },
            (error) => {
                console.error("Error fetching messages:", error);
            }
        );

        return () => unsubscribe();
    }, [selectedConversation]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSelectContact = async (contact) => {
        if (!currentUser) return;

        const revision = ++selectionRevision.current;
        setSelectedContact(contact);
        setSelectedConversation(null);
        setMessages([]);
        setMessageText("");

        try {
            const conversation = await getOrCreateConversation({
                currentUserId: currentUser.uid,
                contactUserId: contact.userId,
                currentUserName,
                contactName: contact.name,
            });

            if (revision !== selectionRevision.current) return;
            setSelectedConversation(conversation);
            await markConversationAsRead(conversation.id, currentUser.uid);
        } catch (error) {
            console.error("Error opening conversation:", error);
            if (revision === selectionRevision.current) toast.error("Could not open this conversation. Please try again.");
        }
    };

    const handleSendMessage = async (event) => {
        event.preventDefault();

        if (isSending || !messageText.trim() || !selectedConversation || !currentUser) return;
        const revision = selectionRevision.current;
        setIsSending(true);
        try {
            await sendMessage({
  conversationId: selectedConversation.id,
  senderId: currentUser.uid,
  receiverId: selectedContact.userId,
  text: messageText,
});

            if (revision === selectionRevision.current) setMessageText("");
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Could not send your message. Please try again.");
        } finally { setIsSending(false); }
    };

    const contactsTitle = userRole === "tutor" ? "Your Students" : "Your Tutors";

    return (
        <section className="messages-panel">
            <div className="messages-header">
                <div>
                    <h2>Messages</h2>
                    <p>
                        Chat only with your {userRole === "tutor" ? "students" : "tutors"}.
                    </p>
                </div>
            </div>

            <div className="messages-layout">
                <aside className="conversations-card">
                    <h3>{contactsTitle}</h3>

                    {loadingContacts ? (
                        <p className="messages-muted">Loading contacts...</p>
                    ) : contacts.length === 0 ? (
                        <div className="empty-messages-box">
                            <h4>No contacts yet</h4>
                            <p>
                                {userRole === "tutor"
                                    ? "Accepted students will appear here."
                                    : "Accepted tutors will appear here."}
                            </p>
                        </div>
                    ) : (
                        <div className="conversations-list">
                            {contacts.map((contact) => {
                                const isActive = selectedContact?.userId === contact.userId;

                                return (
                                    <button
                                        key={contact.requestId}
                                        className={`conversation-card ${isActive ? "active" : ""}`}
                                        onClick={() => handleSelectContact(contact)}
                                    >
                                        <div className="conversation-avatar">
                                            {contact.imageUrl ? (
                                                <img src={contact.imageUrl} alt={contact.name} />
                                            ) : (
                                                contact.name?.charAt(0).toUpperCase()
                                            )}
                                        </div>

                                        <div className="conversation-details">
                                            <h4>{contact.name}</h4>
                                            <p>{contact.subject || "Accepted request"}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </aside>

                <main className="chat-card">
                    {!selectedContact ? (
                        <div className="chat-empty-state">
                            <h3>Select a contact</h3>
                            <p>
                                Choose one of your {userRole === "tutor" ? "students" : "tutors"} to start chatting.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="chat-topbar">
                                <div className="chat-user-avatar">
                                    {selectedContact.imageUrl ? (
                                        <img src={selectedContact.imageUrl} alt={selectedContact.name} />
                                    ) : (
                                        selectedContact.name?.charAt(0).toUpperCase()
                                    )}
                                </div>

                                <div>
                                    <h3>{selectedContact.name}</h3>
                                    <p>{selectedContact.subject || "Active conversation"}</p>
                                </div>
                            </div>

                            <div className="chat-messages">
                                {messages.length === 0 ? (
                                    <div className="chat-empty-state small">
                                        <h3>No messages yet</h3>
                                        <p>Send the first message to start the conversation.</p>
                                    </div>
                                ) : (
                                    messages.map((message) => {
                                        const isOwnMessage = message.senderId === currentUser.uid;

                                        return (
                                            <div
                                                key={message.id}
                                                className={`message-row ${isOwnMessage ? "own-message" : "other-message"
                                                    }`}
                                            >
                                                <div className="message-bubble">
                                                    <p>{message.text}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            <form className="message-input-area" onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    placeholder="Write a message..."
                                    value={messageText}
                                    onChange={(event) => setMessageText(event.target.value)}
                                />

                                <button disabled={isSending || !selectedConversation} type="submit">Send</button>
                            </form>
                        </>
                    )}
                </main>
            </div>
        </section>
    );
}

export default MessagesPanel;
