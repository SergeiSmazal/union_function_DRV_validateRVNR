exports.handler = async (event) => {
    // Eingangsdaten aus der Genesys Cloud Data Action abrufen
    const body = event.body ? JSON.parse(event.body) : event;
    const rvnr = body.rvnr;

    if (!rvnr) {
        console.log("Fehler: Parameter 'rvnr' fehlt im Request.");
        return {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Parameter 'rvnr' is required" })
        };
    }

    // Funktion zur Validierung der Rentenversicherungsnummer (RVNR)
    function DRV_validateRVNR(num) {
        // Prüfung, ob die Länge exakt 12 Zeichen beträgt
        if (!num || num.length !== 12) {
            console.log(`Ungültige Länge (${num ? num.length : 0} Zeichen): ${num}`);
            return false;
        }

        // In Großbuchstaben umwandeln
        const upperNum = num.toUpperCase();

        // 1. Prüfziffer extrahieren (12. Zeichen, Index 11)
        const checkDigit = parseInt(upperNum[11], 10);
        if (isNaN(checkDigit)) {
            console.log(`Prüfziffer ist keine Zahl: ${upperNum[11]}`);
            return false;
        }

        // 2. Den Anfangsbuchstaben des Geburtsnamens (9. Zeichen, Index 8) in eine zweistellige Zahl umwandeln
        // Standard: A = 01, B = 02, ..., Z = 26
        const letterChar = upperNum[8];
        const charCode = letterChar.charCodeAt(0);
        if (charCode < 65 || charCode > 90) {
            console.log(`Ungültiger Buchstabe an Index 8: ${letterChar}`);
            return false; // Sicherstellen, dass es ein Großbuchstabe ist
        }
        
        const letterDigit = charCode - 64; // A = 1, B = 2 ... Z = 26
        const letterString = letterDigit.toString().padStart(2, '0');

        // 3. Bereinigte RVNR für die Berechnung zusammenstellen (erste 8 Zeichen + 2 Ziffern des Buchstabens + 2 Ziffern der laufenden Nummer)
        const cleanRVNR = upperNum.substring(0, 8) + letterString + upperNum.substring(9, 11);

        if (cleanRVNR.length !== 12) return false;

        // 4. Gewichtungsfaktoren für die 12 Positionen gemäß SV-Anweisung / DRV
        // ⚠️ WICHTIG: Die Gewichte müssen in UMGEKEHRTER Reihenfolge angewendet werden!
        const weights = [2, 1, 2, 5, 7, 1, 2, 1, 2, 1, 2, 1];
        let totalCrossSum = 0;

        for (let i = 0; i < 12; i++) {
            const digit = parseInt(cleanRVNR[i], 10);
            if (isNaN(digit)) return false;

            const product = digit * weights[i];
            // Quersumme des Produkts berechnen
            const crossSum = Math.floor(product / 10) + (product % 10);
            totalCrossSum += crossSum;
        }

        // 5. Die errechnete Prüfziffer ist der Rest der Gesamtsumme modulo 10
        const calculatedCheckDigit = totalCrossSum % 10;

        // Debug-Ausgabe in den Logs für die Analyse
        console.log(`Eingegeben: ${num} | Erwartete Prüfziffer: ${calculatedCheckDigit} | Übergebene Prüfziffer: ${checkDigit}`);

        return calculatedCheckDigit === checkDigit;
    }

    const isValid = DRV_validateRVNR(rvnr);

    return {
        isValid: isValid
    };
};
