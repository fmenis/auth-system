import bcrypt from 'bcrypt'

/**
 * Compare two strings, one plain and one hashed
 * @public 
 * @param {string} plain_string
 * @param {string} hashed_string
 * @returns {Promise<boolean>}
 */
export function compareStrings(plain_string, hashed_string) {
    return bcrypt.compare(plain_string, hashed_string);
};

/**
 * Hash a string
 * @public 
 * @param {string} string
 * @returns {Promise<string>}
 */
export function hashString(string, salt_rounds) {
    return bcrypt.hash(string, salt_rounds);
};