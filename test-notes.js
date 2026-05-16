async function testNotes() {
    try {
        const loginRes = await fetch('http://localhost:8081/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'student1', password: 'student123' })
        });
        
        const loginData = await loginRes.json();
        console.log("Login Data:", loginData);
        const token = loginData.token;
        console.log("Logged in! Token length:", token ? token.length : "NO TOKEN");
        
        const notesRes = await fetch('http://localhost:8081/api/notes/mes-notes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const notesData = await notesRes.text();
        console.log("Notes response code:", notesRes.status);
        try {
            console.log("Notes response:", JSON.stringify(JSON.parse(notesData), null, 2));
        } catch {
            console.log("Raw Notes response:", notesData);
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}
testNotes();
