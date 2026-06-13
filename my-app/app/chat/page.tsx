import ChatUI from "../../components/chat/ChatUI";
import "../../styles/ChatUI.css";

export default function ChatPage() {
    return (
        <main className="chatPage">
            <div className="chatPage_container">
                {/* <h1>Chat Page</h1> */}
                <ChatUI/>
            </div>
        </main>
    );
}