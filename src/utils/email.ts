import crypto from 'crypto';

const secretKey = process.env.ENCRYPT_KEY!

export class Email {
    // Function to encrypt an email address
    static async encryptEmail (email: string) {
        const cipher = crypto.createCipher('aes-256-cbc', secretKey);
        let encrypted = cipher.update(email, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
      }
    
    // Function to decrypt an email address
    static async decryptEmail(encryptedEmail: string) {
        const decipher = crypto.createDecipher('aes-256-cbc', secretKey);
        let decrypted = decipher.update(encryptedEmail, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
      }
}