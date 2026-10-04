const BOT_TOKEN = 'BOT_FATHERDAN_OLINGAN_TOKENNI_SHU_YERGA_YOZING';

// Telegram'ga xabar yuborish funksiyasi
async function sendTelegramNotification(chatId, message) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });

        const data = await response.json();
        if (data.ok) {
            console.log("Telegram xabari yuborildi!");
        } else {
            console.error("Telegram xatosi:", data.description);
        }
    } catch (error) {
        console.error("Xabar yuborishda tarmoq xatosi:", error);
    }
}
