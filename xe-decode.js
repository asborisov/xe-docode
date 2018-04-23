const ord = (str) => {
    const ch = str.charCodeAt(0);
    return ch > 0xFF ? (ch - 0x350) : ch;
};

const strpos = (haystack, needle, offset) => {
    const i = (haystack+'').indexOf(needle, (offset || 0));
    return i === -1 ? false : i;
};

const urldecode = (url) => {
    return decodeURIComponent(url.replace(/\+/g, ' '));
};

const decode = (encoded) => {
    // Once you get the encrypted JSON, put it here.
    let encryptedJSON = encoded;

    // Trim any whitespaces
    encryptedJSON = encryptedJSON.trim();

    // The decryption key is the last 4 characters of the encrypted JSON
    let hiddenKey = encryptedJSON.substr(encryptedJSON.length - 4);

    let decryptedKey = ord(hiddenKey.substr(0)) + ord(hiddenKey.substr(1)) + ord(hiddenKey.substr(2)) + ord(hiddenKey.substr(3));
    decryptedKey = (encryptedJSON.length - 10) % decryptedKey;
    decryptedKey = decryptedKey > (encryptedJSON.length - 10 - 4) ? (encryptedJSON.length - 10 - 4) : decryptedKey;

    // The actual decryption key is hidden in the middle of the JSON
    let decryptedKey2 = encryptedJSON.substr(decryptedKey, 10);
    // Remove the encryption key from the JSON string
    encryptedJSON = encryptedJSON.substr(0, decryptedKey) + encryptedJSON.substr(decryptedKey + 10);
    // Decode URI
    encryptedJSON = urldecode(encryptedJSON);
    // Character shift process, doesn't involve any key
    const stringList = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let cursor = 0;
    let shiftedJSON = "";
    // Clear Unwanted characters
    encryptedJSON = encryptedJSON.replace("/[^A-Za-z0-9\+\/\=]/m", "");

    do {
        const char1 = strpos(stringList, encryptedJSON.substr(cursor++, 1));
        const char2 = strpos(stringList, encryptedJSON.substr(cursor++, 1));
        const char3 = strpos(stringList, encryptedJSON.substr(cursor++, 1));
        const char4 = strpos(stringList, encryptedJSON.substr(cursor++, 1));

        const code1 = (char1 << 2) | (char2 >> 4);
        const code2 = ((char2 & 15) << 4) | (char3 >> 2);
        const code3 = ((char3 & 3) << 6) | char4;

        shiftedJSON += String.fromCharCode(code1);
        if (char3 !== 64) {
            shiftedJSON += String.fromCharCode(code2);
        }
        if (char4 !== 64) {
            shiftedJSON += String.fromCharCode(code3);
        }
    } while (cursor < encryptedJSON.length);
    encryptedJSON = urldecode(shiftedJSON);

    // Decrypt every 10th character
    let counter = 0;
    let decryptedJSON = "";
    for (let counter10th = 0; counter10th < encryptedJSON.length; counter10th += 10) {
        let encryptedChar = encryptedJSON[counter10th];
        const shiftKey = decryptedKey2[(counter % decryptedKey2.length - 1) < 0 ?
            (decryptedKey2.length + (counter % decryptedKey2.length - 1)) :
            (counter % decryptedKey2.length - 1)];
        encryptedChar = String.fromCharCode(ord(encryptedChar) - ord(shiftKey));
        decryptedJSON += encryptedChar + encryptedJSON.substr(counter10th + 1, 9);
        counter++;
    }
    // There you go! The decrypted JSON.
    return JSON.parse(decryptedJSON);
};

module.exports = {
    decode,
};
